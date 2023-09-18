import type { BuildSchemaOptions } from 'type-graphql';
import type { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import type { FederationVersion, GqlModuleAsyncOptions, GqlModuleOptions } from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';

export type TypeGraphQLFeatureModuleOptions = Pick<BuildSchemaOptions, 'orphanedTypes'> & {
  referenceResolvers?: Record<string, { __resolveReference: ResolveReferenceFn }>;
};

export type TypeGraphQLRootModuleOptions = Omit<GqlModuleOptions, 'schema' | 'autoSchemaFile' | 'buildSchemaOptions'> &
  Omit<BuildSchemaOptions, 'resolvers' | 'orphanedTypes' | 'container'> & {
    federationVersion?: FederationVersion;
  };

export interface TypeGraphQLRootModuleAsyncOptions
  extends Omit<GqlModuleAsyncOptions, 'inject' | 'useFactory'>,
    Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<Promise<TypeGraphQLRootModuleOptions> | TypeGraphQLRootModuleOptions>,
      'inject' | 'useFactory'
    > {}

export type ResolveReferenceFn = (root: any, context: any, info: GraphQLResolveInfo) => any;
