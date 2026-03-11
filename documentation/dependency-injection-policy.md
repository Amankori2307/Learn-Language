# Dependency Injection Policy

This repo uses Nest's dependency injection container. The default rule is simple: prefer constructor injection by concrete provider type, and only use `@Inject(...)` when the token cannot be inferred safely from the parameter type.

## Default rule

Prefer this:

```ts
constructor(private readonly analyticsService: AnalyticsService) {}
```

Use this only when necessary:

```ts
constructor(@Inject(SOME_TOKEN) private readonly service: SomeInterface) {}
```

## When `@Inject` is required

- the provider is registered with a string, symbol, or custom token
- the constructor type is an interface or type alias, which does not exist at runtime
- the provider comes from a `useFactory`, `useValue`, or similar token-based registration
- multiple implementations share the same static type and you need an explicit token to disambiguate them

## When `@Inject` is usually unnecessary

- controller-to-service injection with a concrete class
- service-to-repository injection with a concrete class provider
- any constructor parameter whose runtime type is the exact Nest provider token already

## Repo guidance

- prefer constructor injection by class for normal module-local controllers, services, and repositories
- reserve explicit tokens for true abstractions and infrastructure seams
- if a provider begins as a concrete class and later needs multiple implementations, introduce a named token at that time instead of pre-optimizing every constructor now
- keep provider ownership obvious: modules wire providers, constructors declare dependencies, and tokens appear only where runtime indirection is real

## Current repo note

The repo still contains several class-based `@Inject(ClassName)` usages. They are not functionally wrong, but they are more explicit than necessary. Future work should prefer plain constructor injection for new code and simplify old usages opportunistically when those files are already being touched.
