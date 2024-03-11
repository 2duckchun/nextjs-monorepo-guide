# nextjs-monorepo-guide

레퍼런스가 하도 없어 직접 구축하는 모노레포 가이드이다.

구글링해서 찾은 레퍼런스들 대부분이 **모노레포는 뭐고 폴리레포에 대해 어떤 것이 장점이다.** 이런 내용만 나오지, 실제로 어떻게 구현하는지는 대충 뭉개서 알려주는 글들이 많다. 

> 후후후 이제는 내가 스스로 구현해야만 하는 레벨에 온 것인가! 

위와 같은 자만한 마음이 들기도 하지만 사실 모노레포는 개념 자체가 중요한거지 세부 구현 방법은 회사마다 아예 달라질 수가 있다. **결국은 각자의 니즈에 맞는 모노레포를 만들 수 밖에 없다.**

그래도 개발 생태계에 일말의 도움이 되고자, 별건 아니지만 내가 이번에 모노레포를 구현해보면서 얻은 지식들을 줄글로 풀어써보고자 한다. 
모노레포 구현에 목마른 행인에게 사막의 오아시스까지는 아니지만 물이 꽉찬, 가시가 덜한 선인장 정도는 되어주고 싶어서다.

**대상 독자**는 모노레포를 구현해보려다가 지치신 분들이다. 지친자여 나에게로 오라.

## 주요 프레임워크, 라이브러리

**모노레포 툴** : pnpm, turborepo

**주요 공통 패키지** : next.js, tailwind, shadcn/ui

툴이 명시되어 있기는한데 그냥 본인이 사용하고 싶은 것 사용해도 된다.

---

## 모노레포란 무엇인가? (GPT 曰)

ChatGPT가 가로되,
```
모노레포(Monorepo)는 "하나의 저장소"를 의미합니다. 소프트웨어 개발에서 사용되는 용어로,
모든 프로젝트 및 라이브러리를 단일 저장소(repository)에 유지하는 방식을 가리킵니다.
이는 분산 버전 관리 시스템(DVCS)인 Git과 같은 도구를 사용하여 관리됩니다.

모노레포는 여러 개별 프로젝트나 라이브러리가 아닌, 여러 프로젝트나 라이브러리를 하나의 대규모 코드베이스로 유지하는 방식을 의미합니다.
이는 여러 프로젝트 간의 공통된 코드나 리소스를 공유하거나, 프로젝트 간의 종속성을 효율적으로 관리할 수 있는 장점을 제공합니다.

모노레포의 장점은 다음과 같습니다:

1. 코드 공유와 재사용 촉진: 모든 프로젝트가 하나의 저장소에 있기 때문에 코드를 공유하고 재사용하기가 훨씬 쉽습니다.

2. 일관된 개발 환경: 모든 프로젝트가 같은 저장소에 있기 때문에 일관된 개발 환경을 유지하는 데 도움이 됩니다.

3. 종속성 관리 용이성: 서로 다른 프로젝트 간의 종속성을 관리하기가 용이합니다.
모든 종속성을 단일 저장소에서 관리하므로 버전 충돌 등의 문제를 최소화할 수 있습니다.

4. 통합 테스팅 및 배포 용이성: 단일 저장소에서 모든 코드가 관리되므로, 통합 테스팅 및 배포를 더욱 쉽게 할 수 있습니다.
```

라고 하셨다. 다 읽을 필요 없다.

추상화해보자면 **모노레포**란 서울특별시같은 **광역자지단체**이다. 은평구, 서대문구, 강서구, 강동구, 송파구 등등을 서울특별시에서 관리하는 것처럼 말이다. 

서울특별시는 서울특별시에 해당하는 지역구에 자원(돈)을 배분해줄 것이다. 각 구마다 서로서로 자원(돈)을 빌려주기도 할 것이다.

모노레포도 마찬가지다. 루트 디렉토리의 워크스페이스는 내부 디렉토리의 워크스페이스에 자원(의존성)을 배분해줄 수 있고, 워크스페이스끼리도 자원(의존성)을 배분해줄 수 있다.

그래서 그런것일까. 내눈에는 서울특별시 지도와 모노레포 그림이 다소 비슷해보인다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/948e548b-5d6f-4004-9312-44b1173b3902)
그림 출처 : 서울특별시

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/ffa66b6c-a457-4f4a-b486-504c61bd0baf)
그림 출처 : https://beomy.github.io/tech/etc/monorepo-concept/

설명이 좀 그로테스크한데 모로가도 서울만 가면 됐다고 대놓고 추상적인 부분은 추상적으로만 이해하자.

## 설치 가이드

## Installation

Install my-project with npm

```bash
npm install my-project
cd my-project
```
    

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

### 3. 루트 레벨에 필수 종속성 설치

```sh
pnpm install next@latest react@latest react-dom@latest typescript@latest @types/node @types/react @types/react-dom tailwindcss@latest autoprefixer@latest postcss@latest -w
```

- next, react, react-dom : next 프로젝트 또는 react로 만들어진 라이브러리에 필수
- @types/node, @types/react, @types/react-dom : 타입 에러 회피용
- tailwind, autoprefixer, postcss : tailwind용

본인의 경우에는 루트에 모든 종속성을 설치할 것이며, 모두 최신화된 것으로 유지할 예정임.

next cli를 이용해 프로젝트를 셋팅했다면 프로젝트 내에 각각 next, react, react-dom도 셋팅 되어있을건데 루트에 모든 종속성을 설치하면 굳이 모든 프로젝트의 node_modules에서 해당 파일들을 가지고있지 않아도 됨. 다만 나같은 경우에는 모든 프로젝트를 next로 만드는 상황이므로 지금과 같은 셋팅이 유효한 것이고, vue나 next, vite 등 프로젝트 별로 라이브러리나 번들러를 다르게 사용하고 있는 경우에는 각각 프로젝트별로 종속성을 설치하는게 옳음.

### 4. 패키지로 관리할 공용 코드들 분석 후 분리

- 확실히 공통적으로 사용될 수 있는 코드들만 패키지로 관리하는 것이 좋을 것 같음. 어거지로 모든 것을 넣다간 오히려 관리 비용이 증가할 것임.

- config 파일에서는 **tailwind**, **styles**, **eslint**, **tsconfig** 등이 패키지로 관리될 수 있을 것 같음.

- 설정 외 라이브러리나 ui 등은 개발하면서 패키지인지 앱스인지 판단하면 될 것 같음.

#### 4-1. tsconfig 패키지화

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

#### 4-2 tailwind 패키지화

먼저 `packages/tailwind-config` 디렉토리를 만들어 준 뒤 package.json을 생성함. 필자는 pnpm을 사용하고 있으므로 아래 키워드로 package.json을 생성해주고 있음.

```sh
pnpm init
```

package.json는 아래와 같이 설정해줌.

```json
// package.json
{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "main": "./index.ts",
  "license": "MIT"
}
```

이후 index.ts 파일을 만들어 내부에 아래와 같이 넣어준다.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
```

이후 루트 디렉토리에 해당 디펜던시를 전역으로 설치해준다.

```sh
pnpm i @repo/tailwind-config -w
```

셋팅 후에 각 프로젝트의 tailwind.config.ts에 해당 테일윈드를 import해서 디스트럭쳐링 문법을 통해 재사용한다.

```ts
import type { Config } from "tailwindcss";

import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};
export default config;
```

#### 4-2 ui 패키지화

```
√ Would you like to use TypeScript (recommended)? ... no / yes
√ Which style would you like to use? » Default
√ Which color would you like to use as base color? » Slate
√ Where is your global CSS file? ... ./globals.css
√ Would you like to use CSS variables for colors? ... no / yes
√ Are you using a custom tailwind prefix eg. tw-? (Leave blank if not) ...
√ Where is your tailwind.config.js located? ... tailwind.config.ts
√ Configure the import alias for components: ... @ui/shadcn
√ Configure the import alias for utils: ... @ui/lib/utils
√ Are you using React Server Components? ... no / yes
√ Write configuration to components.json. Proceed? ... yes
```

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
