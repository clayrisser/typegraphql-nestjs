import { createParamDecorator as nestjsCreateParamDecorator, applyDecorators } from '@nestjs/common';
import { createParamDecorator as typeGraphqlCreateParamDecorator, ResolverData } from 'type-graphql';

export declare type CustomParamFactory<TData = any, TInput = any, TOutput = any, TContextType = any> = (
  data?: TData,
  input?: TInput,
  resolverData?: ResolverData<TContextType>,
) => TOutput;

export function createParamDecorator<FactoryData = any, FactoryInput = any, FactoryOutput = any, TContextType = any>(
  factory: CustomParamFactory<FactoryData, FactoryInput, FactoryOutput>,
) {
  return applyParamDecorators(
    typeGraphqlCreateParamDecorator((typeGraphqlResolverData: ResolverData<TContextType>) => {
      return factory(undefined, undefined, typeGraphqlResolverData);
    }),
    nestjsCreateParamDecorator((data: FactoryData, input: FactoryInput) => {
      return factory(data, input);
    })(),
  );
}

export function applyParamDecorators(...decorators: Array<ParameterDecorator>) {
  return ((target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey, parameterIndex);
    }
  }) as ParameterDecorator;
}

export function DecorateAll(decorator: MethodDecorator, options: { exclude?: string[]; deep?: boolean } = {}) {
  return (target: any) => {
    let descriptors = Object.getOwnPropertyDescriptors(target.prototype);
    if (options.deep) {
      let base = Object.getPrototypeOf(target);
      while (base.prototype) {
        const baseDescriptors = Object.getOwnPropertyDescriptors(base.prototype);
        descriptors = { ...baseDescriptors, ...descriptors };
        base = Object.getPrototypeOf(base);
      }
    }
    for (const [propName, descriptor] of Object.entries(descriptors)) {
      const isMethod = typeof descriptor.value === 'function' && propName !== 'constructor';
      if (options.exclude?.includes(propName)) continue;
      if (!isMethod) continue;
      decorator(target.prototype, propName, descriptor);
      Object.defineProperty(target.prototype, propName, descriptor);
    }
  };
}
