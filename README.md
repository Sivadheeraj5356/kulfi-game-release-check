# Kulfi Game Release Check

A client-side release-readiness checker for daily couple games. It scores whether a game candidate names its audience, covers loading, empty, error and retry states, and defines the user signal the team should watch after launch.

## Use

Open `index.html`, add one game per line, and run the check:

```text
Memory Match | partners in different cities | loading, empty, error, retry | completion and return next day
```

## Test

```bash
npm test
```

No external services, build step or secrets.
