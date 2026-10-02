# Next Action Engine

El motor es core, no Eli. En MVP es determinístico y devuelve una sola acción.

```ts
type NextAction = { actionType:string; title:string; description:string; reason:string; estimatedMinutes:number; primaryCTA:string; secondaryCTA?:string }
```

Orden inicial implementado: (1) onboarding incompleto, (2) seguimiento pendiente vencido/hoy, (3) embajador en `PRACTICE` sin `FIRST_PRACTICE`, (4) embajador sin `FIRST_ACTION`, (5) persona abierta sin siguiente paso, (6) recurso de aprendizaje. El módulo puro `src/modules/next-action` devuelve una sola acción; el CTA crea `actions` y registra `next_action_started`. El resultado del roleplay activa milestone/stage y al siguiente render se calcula una acción distinta.
