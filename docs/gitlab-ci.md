---
favicon: img/logo.png
---
# Running LAMS via GitLab CI

This example shows how to run LAMS with GitLab CI and was contributed by [PieterjanCriel](https://github.com/PieterjanCriel). Thanks!

## Instructions

Use the following dockerfile. This image is stored in the registry (e.g., registry.example.com/look-at-me-sideways-bot)

```dockerfile
FROM alpine:edge

WORKDIR /opt/lams

RUN apk --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ upgrade && \
 apk --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ add \
 nodejs nodejs-npm

RUN  npm i -g @looker/look-at-me-sideways@2 --unsafe-perm

CMD ["/bin/sh"]
```

Add a `gitlab-ci.yml` file to your LookML repo. (Populate the LAMS reporting arguments in the script)

```yml
stages:
  - 👀 Look at me sideways

Lint:
  stage: 👀 Look at me sideways
  image:
    name: registry.example.com/look-at-me-sideways-bot
    entrypoint: [""]
  script:
  # See [PRIVACY.md](https://github.com/looker-open-source/look-at-me-sideways/blob/master/PRIVACY.md)
  - lams --reporting=... --output-to-cli
  artifacts:
    expire_in: 2 weeks
    when: always
    paths:
      - issues.md
  when: on_success
  allow_failure: true
```

On every commit, LAMS will run and save the issues.md to the GitLab CI artifacts.