# 모노레포 가이드

레퍼런스가 하도 없어 직접 구축하는 모노레포 가이드이다. 

사실 본인의 상황에 100% 맞는 모노레포 관련 레퍼런스는 찾기 어렵다. 모노레포는 추상적인 개념이며 세부 구현 방법은 사용자마다 달라질 수 밖에 없기 때문이다.

즉, 모노레포를 제대로 사용하려면 모노레포라는 거푸집 안에 각자의 니즈를 녹여 직접 아키텍처를 구성해야 한다.

하여 이 가이드는 모노레포를 자유자재로 구현하기 위해 개발자가 알아야하는 키워드 및 사고 방식을 공유하기위해 작성되었다.

## 목차

1. [모노레포란 무엇인가?](#모노레포란-무엇인가)
    - [추상화](#추상화)
    - [구체화](#구체화)
2. [용어정의](#용어정의)
3. [구축해보기](#구축해보기)
    - [터보레포 스캐폴딩 설치](#터보레포-스캐폴딩-설치)
    - [디펜던시 구조 설계](#디펜던시-구조-설계)
    - [공용 패키지 설계](#공용-패키지-설계)
    - [UI 패키지 설계](#UI-패키지-설계)
4. [빌드](#빌드)
    - [docker](#docker)
---

## 모노레포란 무엇인가?

모노레포가 무엇인지 추상적인 관점에서 이해해본 뒤, 구체적인 관점에서도 한번 더 알아보자.

### 추상화

모노레포를 극단적으로 추상화하면 **서울특별시**라고 할 수 있다.

- 서울특별시는 25개의 자치구를 가진다.
- 25개의 자치구는 서울특별시 내에 위치한다.
- 서울특별시는 자치구에 자원(돈)을 배분해줄 수 있다. 또한 각 자치구 사이에서도 자원(돈)을 배분할 수 있다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/948e548b-5d6f-4004-9312-44b1173b3902)

출처 : 서울특별시 건설알림이

모노레포를 표현한 그림도 서울특별시 지도와 크게 다르지 않다. 서울특별시와 서울특별시 내 자치구를 각각 리포지토리와 프로젝트로 치환하면 아래의 그림처럼 될 것이다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/ffa66b6c-a457-4f4a-b486-504c61bd0baf)

출처 : https://beomy.github.io/tech/etc/monorepo-concept/

### 구체화

모노레포를 좀 더 풀어서 이해해보자.

모노레포란 두개 이상의 프로젝트가 동일한 리포지토리에서 관리되는 소프트웨어 개발 전략이라고 할 수 있다. 각 프로젝트들은 고유하게 관리되지만, 저장소는 하나만을 사용한다. 

단, 다수의 프로젝트가 하나의 저장소에 존재한다는 것만으로는 모노레포라고 할 수 없다. **모노레포에서 중시되는 것은 프로젝트 또는 패키지와의 관계(relationship)이다.** 여러개의 프로젝트와 패키지가 하나의 저장소에 위치하며 서로의 자원들을 공유하는 관계가 성립되어야 비로소 모노레포를 구성했다고 할 수 있을 것이다.

## 용어정의

모노레포를 본격적으로 구현하기 전에 몇가지 용어의 정의를 확실히 할 필요가 있다. 모노레포의 특성상 하나의 리포지토리에 여러개의 패키지와 디펜던시가 뒤엉킬 것인데, 패키지가 뭔지, 디펜던시가 어떤건지 정의를 정확히 모르면 구현 시 답답할 수 있다.
모노레포를 직접 구현할 정도라면 패키지매니저나 디펜던시, 패키지의 정의를 어느정도 알 것이다. 그럼에도 불구하고 모노레포 구현에 꼭 필요한 용어를 한번 더 정의해보자.

- **라이브러리(library)** ★★
    - 재사용 가능한 코드의 집합으로, 특정 기능을 수행하기 위한 함수, 클래스, 모듈 등이 포함된다.
    - 라이브러리는 주로 **패키지의 일부로 제공되며, 다른 프로젝트에 호출되어 사용할 수 있다.**
    - 자바스크립트 생태계에서는 라이브러리를 패키지화해서 npm에 공유를 하고 있다. 즉 배포된 라이브러리와 npm에서 설치한 패키지는 거의 비슷한 개념이라고 생각할 수 있다.
 
- **패키지(package)** ★★
    - 특정 기능들을 묶어놓은 단위이다.
    - 주 목적은 **소프트웨어의 배포나 공유를 용이하게 하기 위함**이며, 다른 프로젝트에서 재사용이 가능하도록 모듈화되어 있다.

- **디펜던시(dependency)** ★★
    - 어떤 프로젝트 또는 패키지나 라이브러리가 다른 패키지에 종속되어있는 상태를 나타낸다.
    - 즉, **특정 패키지나 라이브러리를 사용하기 위해 반드시 설치가 선행되어야 하는 패키지를 말한다.**
 
![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/acf72c70-67a1-4957-806a-0302e4a91474)

- **패키지 매니저(package manager)** ★★★★★
    - 소프트웨어 개발에 사용되는 도구로 프로젝트에서 필요한 외부 패키지(라이브러리 등)을 관리하는데 사용된다. 패키지 설치, 의존성 관리, 버전관리 등을 패키지 매니저를 이용해 편리하게 이용할 수 있다.
    - 대표적인 패키지 매니저로는 **npm**, **yarn**, **pnpm** 등이 있다.

- **워크스페이스(workspace)** ★★★★★
    - 단순히 생각하면 **협업공간** 이라고 할 수 있다.
    - 소프트웨어 개발 관점에서 생각하면 **다양한 소스코드 파일들과 자원들을 관리하는 파일이나 디렉토리의 개념**이다.
    - 즉, 협업을 위해 필요한 자원들을 관리하는 공간이므로 **모노레포의 핵심**이라고 할 수 있다.

## 구축해보기

### 터보레포 스캐폴딩 설치

### 디펜던시 구조 설계

### 공용 패키지 설계

### UI 패키지 설계

## 빌드

### docker

수정 필요

---
이번 모노레포 구현에 사용할 기술들이다. 

각 라이브러리/프레임워크를 설명하면서 모노레포 구성에 필요한 키워드들도 함께 도출해볼 것이다.
**
- **pnpm** : 패키지 매니저 npm과 비슷하나, npm보다 성능면에서 좋음 **(모노레포 구축에 필수)**
- **Turborepo** : 모노레포 빌드 시스템 **(모노레포 구축을 도와주는 툴)**

### pnpm

pnpm은 npm에서 발전된 패키지 매니저로써 기존 npm보다 디스크 활용 능력이 뛰어나고 속도가 빠르다. 1년 전까지만 해도 사용자가 많이 없었던 것 같은데 이제는 알음알음 많이들 쓰시는 것 같다. 그럼에도 아직 우리나라에서는 많은 분들이 yarn이나 npm을 그대로 사용하고 있어서 참고할만한 레퍼런스가 많이 없다. 그래도 해외 레퍼런스는 활발하게 나오고 있으니 pnpm을 사용하는 것은 좋은 선택이다.

공식문서도 잘 되어있다. 국가별 언어도 지원하며 한글화는 약 50% 진행이 되어 있다.

https://pnpm.io/ko/

#### pnpm > workspace

모노레포를 구성할 때 가장 중요한 개념은 workspace이다. workspace는 단일 리포지토리에 여러개의 프로젝트를 셋업할 수 있게 해주는 개념으로 npm, yarn, pnpm과 같은 패키지 매니저들은 각각의 문법으로 workspace를 지원한다. 

pnpm 경우에는 프로젝트의 루트에 `pnpm-workspace.yaml` 를 생성하여 workspace를 관리할 수 있다.

`pnpm-workspace.yaml` 은 yaml 문법을 사용하여 작성할 수 있으며, 아래와 같이 코딩한다.

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

자세한 사항은 https://pnpm.io/workspaces 공식문서를 참고하자.

### turborepo

터보레포는 모노레포의 관리를 돕는 빌드 시스템이다. **즉, 터보레포 없이 pnpm만으로도 모노레포를 구성할 수 있으며, 터보레포는 단순히 보조를 하는 역할이라고 봐도 무방하다.** 하지만 라이브러리의 도움 없이 밑바닥부터 모두 설계하는건 시간을 너무 많이 잡아먹으므로 라이브러리를 사용할 수 있다면 사용하는 것이 현명하다. 

#### turborepo 특징

터보레포의 특징은 캐싱 기능을 다양하게 지원한다는 것이다. 모노레포는 다수의 프로젝트가 하나의 레포에 포함되므로 작업량이 늘어나면 늘어날수록 빌드 시간도 그에 비례해서 증가할 수밖에 없는데, 터보레포는 캐싱 지원을 통해 빌드 시간을 단축시켜 준다.

그 외에도 터보레포로 프로젝트를 인스톨하면 next.js로 구성된 스캐폴딩을 제공해주는데 이 스캐폴딩 구조를 직접 뜯어서 모노레포 구현법을 스스로 체득하는 방법도 권장할만한 방법이다.

본격적인 구현 시작 전에 아래 공식문서를 읽어보는 것을 추천한다.

https://turbo.build/repo/docs/handbook

https://turbo.build/repo/docs

---

## 모노레포 만들기

새로운 모노레포를 설치해보자. 앞서 말했듯이 터보레포는 모노레포의 관리를 돕는 시스템일 뿐, 직접 workspace를 선언하는 툴은 아니다.

이 가이드에서는 pnpm을 사용하므로 pnpm을 먼저 설치해야 한다. https://pnpm.io/installation 이 링크를 참고해서 pnpm을 설치하자.

pnpm 설치 완료 후 모노레포를 구성할 폴더에 아래 명령어를 입력하고 workspace는 pnpm으로 선택하자.

```
pnpm dlx create-turbo@latest
```

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/b8cbef6e-3e95-4774-b262-4558201076b6)

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/a0b61913-226b-487f-86e0-add5039aa814)

터보레포로 모노레포를 생성하면 내부에 apps, packages 디렉토리를 비롯한 파일들이 하나의 코드베이스에 생성된다.

```
apps/web : next.js로 생성된 프로젝트
apps/docs : next.js로 생성된 프로젝트
packages/ui : 공용 리액트 컴포넌트
packages/eslint-config-custom : 공용 eslint
packages/tsconfig : 공용 tsconfig.json
```

apps 디렉토리와 packages 디렉토리는 pnpm-workspace.yaml에서 관리하는 workspace이며, workspace내에 위치한 프로젝트 또는 공용 코드들은 각각의 `packages.json` 을 가지고 있어야 한다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/c9c6369d-4f20-4b19-a0ff-b1461781ef85)




## next.js


Install my-project with npm

```bash
npm install my-project
cd my-project
```



---

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


출처 <a href="https://kr.freepik.com/free-vector/flat-design-usa-states-outline-map_25106229.htm#query=usa%20map&position=0&from_view=keyword&track=ais&uuid=0a993a35-e39a-4422-bfe3-9b48f079840e">Freepik</a>
