import deepMerge from 'lodash.merge';
import gql from 'graphql-tag';
import type OptionsPreparatorService from './prepare-options.service';
import type { ClassType, NonEmptyArray } from 'type-graphql';
import type { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import type { TypeGraphQLRootModuleOptions } from './types';
import { ApolloFederationDriver } from '@nestjs/apollo';
import { Injectable, Inject } from '@nestjs/common';
import { TYPEGRAPHQL_ROOT_MODULE_OPTIONS, TYPEGRAPHQL_FEATURE_MODULE_OPTIONS } from './constants';
import { buildSchema, createResolversMap } from 'type-graphql';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { printSubgraphSchema } from './helpers';

@Injectable()
export default class TypeGraphQLOptionsFactory implements GqlOptionsFactory {
  constructor(
    @Inject(TYPEGRAPHQL_ROOT_MODULE_OPTIONS)
    private readonly rootModuleOptions: TypeGraphQLRootModuleOptions,
    private readonly optionsPreparatorService: OptionsPreparatorService,
  ) {}

  async createGqlOptions(): Promise<GqlModuleOptions> {
    const { globalMiddlewares, driver, federationVersion } = this.rootModuleOptions;
    const { resolversClasses, container, orphanedTypes, referenceResolvers } =
      this.optionsPreparatorService.prepareOptions(TYPEGRAPHQL_FEATURE_MODULE_OPTIONS, globalMiddlewares);
    const isFederatedModule = driver === ApolloFederationDriver;
    let schema = await buildSchema({
      ...this.rootModuleOptions,
      resolvers: resolversClasses as NonEmptyArray<ClassType>,
      orphanedTypes,
      container,
    });
    if (isFederatedModule) {
      if (!federationVersion) {
        throw new Error(
          'You need to provide `federationVersion` option to `TypeGraphQLModule.forRoot()` when using `ApolloFederationDriver`',
        );
      }
      // build Apollo Subgraph schema
      const federatedSchema = buildSubgraphSchema({
        typeDefs: gql(printSubgraphSchema(schema, federationVersion)),
        // merge schema's resolvers with reference resolvers
        resolvers: deepMerge(createResolversMap(schema) as any, referenceResolvers),
      });
      return {
        ...this.rootModuleOptions,
        schema: federatedSchema,
      };
    }
    return {
      ...this.rootModuleOptions,
      schema,
    };
  }
}
