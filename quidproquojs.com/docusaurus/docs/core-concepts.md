---
sidebar_position: 2
---

# Core Concepts

Quidproquo follows a Redux-like action/processor pattern where business logic is expressed as generator functions ("stories") that yield actions, which are then processed by platform-specific implementations.

## Actions

Type-safe Redux-style actions with a type and optional payload.

## Stories

Generator functions that compose business logic by yielding actions and receiving results.

## Action Processors

Platform-specific implementations that execute actions.

## Runtime

The orchestration layer that executes stories by processing yielded actions through the appropriate processors.