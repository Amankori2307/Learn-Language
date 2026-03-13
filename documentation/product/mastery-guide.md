# Mastery Guide

This document explains what “mastery” means in the app, how it is earned, and which signals affect it. It is written for learners and reviewers who want to understand the rules behind mastery tracking.

## What mastery means

Mastery is a per‑word progress state. Each word moves through levels based on consecutive correct answers. A higher mastery level means the app will schedule that word farther into the future.

Mastery is tracked per learner and per word.

## Mastery levels

Mastery is derived from your current **correct streak** for a word.

Levels:

- Level 0: no correct streak yet
- Level 1: streak of **1** correct answer
- Level 2: streak of **3** correct answers
- Level 3: streak of **5** correct answers
- Level 4: streak of **7** correct answers

If you miss a word, the correct streak resets to 0 and the mastery level drops accordingly.

## What counts as a “correct” answer

The app records each answer as correct or incorrect based on the quiz evaluation rules. Only correct answers increase the streak.

## What influences scheduling (when the word returns)

The next review date is calculated using:

- your current streak
- an **ease factor** that grows with consistent correct answers
- the quality of each answer

The first correct answer keeps the interval short. After the second correct answer, the interval grows more quickly based on the ease factor.

If you answer incorrectly, the interval resets to the shortest default and the ease factor decreases.

## Answer quality signals

Answer quality is derived from:

- correctness
- a system-generated confidence signal inferred from response time and current progress state
- response time

Faster, more reliable recall raises the inferred confidence signal. Slower or less stable recall lowers it.

Quality affects the ease factor, which influences how quickly your review intervals grow.

## Directional strength

The app also tracks **direction‑specific strength**:

- source language → English
- English → source language

These strengths are updated separately based on your answers in each direction.

## Summary

- Mastery is streak‑based and increases at 1, 3, 5, and 7 correct answers.
- Incorrect answers reset the streak and shorten the next review interval.
- The app now infers recall confidence automatically instead of asking learners to self-report it.
- Strength is tracked separately for both translation directions.

If the mastery rules change in the future, this document will be updated alongside the code.
