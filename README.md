# Turborepo starter

레퍼런스가 하도 없어 직접 만드는 turborepo + nextjs + shadcn/ui 적용 가이드

## 설치 가이드

### 1. turborepo 설치

```sh
pnpm dlx create-turbo@latest
```

### 2. 기존 apps에 있는 디렉토리를 지우고 새로운 next app 설치

```sh
pnpm create next-app@latest 프로젝트명
```

본인 프로젝트의 경우 아래와 세팅이 같음.

```
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like to use `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to customize the default import alias (@/*)? ... No
```

### 3. 패키지로 관리할 공용 코드들 분석

- 확실히 공통적으로 사용될 수 있는 코드들만 패키지로 관리하는 것이 좋을 것 같음. 어거지로 모든 것을 넣다간 오히려 관리 비용이 증가할 것임.

- config 파일에서는 **tailwind**, **styles**, **eslint**, **tsconfig** 등이 패키지로 관리될 수 있을 것 같음.

- 설정 외 라이브러리나 ui 등은 개발하면서 패키지인지 앱스인지 판단하면 될 것 같음.

#### 3-1. tsconfig 패키지화

- turborepo의 기본 설정에 따라 `packages/typescrpt-config` 에 이미 셋팅이 어느정도 되고 있음.

- 그러나 turborepo의 기본 셋팅을 그대로 사용하기에는 다소 저열한 느낌이 있음. 실제로 기존의 설정을 사용하면 가성비없는 에러가 계속 나옴.

- 따라서 본인은 create-next-app을 통해 만들어진 tsconfig를 `packages/typescript-config/next.json` 에 붙여넣을 것임

- 다만, plugin과 paths는 apps/프로젝트에서 재설정할 예정임.

- plugin의 경우, next 디펜던시가 각각의 프로젝트에 귀속이 되어있기 때문이고, paths는 실제로 프로젝트마다 상이하게 설정할 수 있기 때문임.

```ts
// packages/typescript-config/nextjs.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    // "plugins": [
    //   {
    //     "name": "next"
    //   }
    // ],
    // "paths": {
    //   "@/*": ["./src/*"]
    // }
    // 주석단 부분은 삭제하셔도 좋습니다.
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

packages에 tsconfig를 설정한 후, 각각의 프로젝트에 @repo/typescript-config를 개발의존성으로 설치해줌.

```sh
pnpm add -D @repo/typescript-config
```

이후 프로젝트의 tsconfig.json에 config 파일을 extends함.

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

> 개발 의존성 설치를 하지 않아도 동작을 하긴 함. 최상단 node_modules에 @repo가 존재하므로 사실상 바로 extends 해도 상관 없음.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
