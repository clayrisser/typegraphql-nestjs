import type { ClassType, ContainerType } from 'type-graphql';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import type { Middleware } from 'type-graphql/dist/interfaces/Middleware';
import type { ModulesContainer, ModuleRef } from '@nestjs/core';
import type { TypeGraphQLFeatureModuleOptions } from './types';
import { ContextIdFactory } from '@nestjs/core';
import { Injectable, flatten } from '@nestjs/common';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { getMetadataStorage } from 'type-graphql';

@Injectable()
export default class OptionsPreparatorService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  prepareOptions(featureModuleToken: string, globalMiddlewares: Middleware<any>[] = []) {
    const globalResolvers = getMetadataStorage().resolverClasses.map((metadata) => metadata.target);
    const globalMiddlewareClasses = globalMiddlewares.filter((it) => it.prototype) as Function[];

    const featureModuleOptionsArray: TypeGraphQLFeatureModuleOptions[] = [];
    const resolversClasses: ClassType[] = [];
    const providersMetadataMap = new Map<Function, InstanceWrapper<any>>();

    for (const module of this.modulesContainer.values()) {
      for (const provider of module.providers.values()) {
        if (typeof provider.name === 'string' && provider.name.includes(featureModuleToken)) {
          featureModuleOptionsArray.push(provider.instance as TypeGraphQLFeatureModuleOptions);
        }
        if (globalResolvers.includes(provider.metatype)) {
          providersMetadataMap.set(provider.metatype, provider);
          resolversClasses.push(provider.metatype as ClassType);
        }
        if (globalMiddlewareClasses.includes(provider.metatype)) {
          providersMetadataMap.set(provider.metatype, provider);
        }
      }
    }

    const orphanedTypes = flatten(featureModuleOptionsArray.map((it) => it.orphanedTypes));

    const referenceResolversArray = [...featureModuleOptionsArray].filter((it) => it.referenceResolvers);
    const referenceResolvers =
      referenceResolversArray.length > 0
        ? Object.fromEntries(referenceResolversArray.flatMap((it) => Object.entries(it.referenceResolvers!)))
        : undefined;

    const container: ContainerType = {
      get: (cls, { context }) => {
        let contextId = context[REQUEST_CONTEXT_ID];
        if (!contextId) {
          contextId = ContextIdFactory.create();
          context[REQUEST_CONTEXT_ID] = contextId;
        }
        const providerMetadata = providersMetadataMap.get(cls)!;
        if (providerMetadata.isDependencyTreeStatic() && !providerMetadata.isTransient) {
          return this.moduleRef.get(cls, { strict: false });
        }
        return this.moduleRef.resolve(cls, contextId, { strict: false });
      },
    };

    return {
      resolversClasses,
      orphanedTypes,
      container,
      featureModuleOptionsArray,
      referenceResolvers,
    };
  }
}
