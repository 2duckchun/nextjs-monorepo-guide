# 모노레포 가이드

레퍼런스가 하도 없어 직접 작성하는 모노레포 가이드이다.

사실 본인의 상황에 100% 맞는 모노레포 관련 레퍼런스는 찾기 어렵다. 모노레포는 사랑과 우정같은 추상적인 개념이며 세부 구현 방법은 사용자마다 달라질 수 밖에 없기 때문이다.

즉, 모노레포를 제대로 사용하려면 모노레포라는 거푸집 안에 각자의 니즈를 녹여 직접 구조를 구성해야 한다.

하여 이 가이드에서는 모노레포를 자유자재로 구현하기 위해 개발자가 알아야하는 키워드 및 사고 방식과 간단한 구현 설계를 공유한다.

## 목차

1. [모노레포란 무엇인가?](#모노레포란-무엇인가)
   - [추상화](#추상화)
   - [구체화](#구체화)
2. [용어정의](#용어정의)
3. [구축해보기](#구축해보기)
   - [패키지매니저 선택](#패키지매니저-선택)
   - [터보레포 스캐폴딩 설치](#터보레포-스캐폴딩-설치)
   - [패키지 구조 설계](#패키지-구조-설계)
     - [루트 패키지 설계](#루트-패키지-설계)
     - [apps에 프로젝트 추가](#apps에-프로젝트-추가)
     - [타입스크립트 패키지 만들기](#타입스크립트-패키지-만들기)
     - [테일윈드 패키지 만들기](#테일윈드-패키지-만들기)
     - [린트 설계(전역 설정)](#린트-설계전역-설정)
     - [UI 패키지 만들기](#ui-패키지-만들기)
4. [부록(혼자서도 잘해요)](#부록혼자서도-잘해요)
   - [공용 css 패키지화 하기](#공용-css-패키지화-하기)
   - [vercel, docker로 배포해보기](#vercel-docker로-배포해보기)
   - [터보레포의 부가적인 기능](#터보레포의-부가적인-기능)

---

## 모노레포란 무엇인가?

모노레포가 무엇인지 추상적인 관점에서 먼저 이해해보자.

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

모노레포란 두개 이상의 프로젝트가 동일한 **저장소(Repository)** 에서 관리되는 소프트웨어 개발 전략이다. 하지만 프로젝트를 저장소 하나에 물리적으로 욱여넣었다고 해서 모노레포를 구성했다고는 할 수 없다.

**모노레포에서 중시되는 것은 패키지와 프로젝트의 관계(relationship)** 일 것이다. 프로젝트와 패키지가 하나의 저장소에 위치하면서 코드 자원을 효율적으로 공유하는 상황이 구축되어야 잘 구축된 모노레포라고 할 수 있다.

## 용어정의

모노레포를 본격적으로 구현하기 전에 몇 가지 용어의 정의를 확실히 할 필요가 있다. 모노레포의 특성상 하나의 저장소에 여러개의 패키지와 디펜던시가 뒤엉킬 것인데, 패키지가 뭔지, 디펜던시가 어떤건지에 대해 정의를 정확히 모르면 구현에 애를 먹을 수 있다. 다행히 모노레포에서 다룰 용어들에는 어려운 개념이 없다. 모노레포 구현을 직접 시도해볼만한 정도라면 패키지매니저, 디펜던시, 패키지, 라이브러리 등의 정의를 어느정도 알고 있을 것이다. 그럼에도 불구하고 모노레포 구현에 사용되는 용어를 한번 더 정의해보자.

- **라이브러리(library)**

  - 재사용 가능한 코드의 집합으로, 특정 기능을 수행하기 위한 함수, 클래스, 모듈 등이 포함된다.
  - 라이브러리는 주로 **패키지의 일부로 제공되며, 다른 프로젝트에 호출되어 사용할 수 있다.**
  - 자바스크립트 생태계에서는 라이브러리를 패키지화해서 npm에 공유하고 있다.
  - 즉, **npm에 배포된 라이브러리는 패키지화를 거친 것**으로 볼 수 있다.

- **패키지(package)**

  - 넓게는 특정 소프트웨어, 좁게는 재사용 가능한 코드를 배포하거나 공유하기위해 **번들링**한 것을 말한다.
  - 주 목적은 어디까지나 **배포나 공유를 용이하게 하기 위함**이며, 다른 프로젝트에서 재사용이 가능하도록 모듈화되어 있어야 한다.

- **디펜던시(dependency)**

  - 어떤 패키지나 라이브러리가 다른 패키지에 종속되어있는 상태를 나타낸다.
  - 즉, **특정 패키지나 라이브러리를 사용하기 위해 선행 설치가 요구되는 패키지**라고 정의할 수 있다

- **패키지 매니저(package manager)**

  - 소프트웨어 개발에 사용되는 도구로 프로젝트에 필요한 디펜던시를 관리하는데 사용된다.
  - 패키지 매니저를 이용해 패키지 설치, 디펜던시 관리, 버전관리 등을 편리하게 이용할 수 있다.
  - 대표적인 패키지 매니저로는 **npm**, **yarn**, **pnpm** 등이 있다.

- **워크스페이스(workspace)**
  - 직역하면 **협업공간** 이다. = 패키지들이 협업하는 공간
  - 워크스페이스는 디렉토리의 개념으로, 다양한 소스코드와 자원들을 관리하는 공간이다.
  - 코드 자원을 관리하는 공간이므로 **모노레포의 핵심**이라고 할 수 있다.

## 구축해보기

본격적으로 구축하기에 앞서 모노레포에 관해 실용적인 측면에서 자세히 설명된 터보레포의 공식문서의 [모노레포 핸드북](https://turbo.build/repo/docs/handbook)을 읽어보자.

모노레포의 개념에 대해 아무것도 모른다면 꼭 읽는 것을 추천한다. 위 공식문서만 잘 읽어도 모노레포에 대한 인사이트를 얻을 수 있다.

### 패키지매니저 선택

모노레포를 구축하기전에 사용할 패키지매니저를 하나 골라야 한다. 또한 모노레포를 위해 선택할 패키지매니저는 워크스페이스 기능을 반드시 제공해야한다.

다행히도 자바스크립트 생태계의 메이저 패키지매니저들은 모두 workspace 기능을 제공한다.

- yarn
- **pnpm** ← 나의 선택
- npm
- bun

나는 패키지매니저로 주로 pnpm을 애용한다. npm에 비해 속도도 빠르고, npm에서 pnpm으로 마이그레이션하기도 용이하기 때문이다. 그러나 꼭 pnpm을 사용할 필요는 없고, 본인이 사용하고싶은 패키지매니저를 사용하면 된다.

딱히 패키지매니저에 대한 고집이 없다면 pnpm을 한번 사용해보자. [여기](https://pnpm.io/installation)를 참고해서 각 OS 설치방법에 맞게 pnpm을 설치하고, pnpm 공식문서를 간단하게 훑어보자. 특히 pnpm은 npm과는 다른 workspace 선언 방식을 가지고 있으므로, 다음 스텝으로 넘어가기전에 pnpm 공식문서의 [workspace](https://pnpm.io/workspaces)는 꼭 정독해보자.

### 터보레포 스캐폴딩 설치

위의 공식문서를 정독했다면 모노레포 빌드 툴 없이도 모노레포 환경 자체는 구축할 수 있을 것이다. 하지만 A-Z까지 모든 것을 구현하기엔 시간이 많이 걸린다.

시간이 많다면 직접 모든 것을 구현하는 것도 나쁘지는 않겠지만, 그럴 여유가 없다면 고민할 시간을 덜어줄 수단으로 빌드 툴을 이용하여 모노레포 스캐폴딩을 설치하는 것도 방법이다.

나는 빌드 툴로 터보레포를 쓰려고 한다. 터보레포를 가장 큰 이유는 하나다. 버셀이 인수했기 때문... (...)

그 외에도 터보레포로 프로젝트를 인스톨하면 next.js를 기반으로 한 스캐폴딩을 제공해준다. 이 스캐폴딩 구조를 직접 뜯어서 모노레포 구현법을 스스로 체득하는 것도 권장할만한 방법이다.

그렇다면 터보레포로 모노레포 구현을 시작해보자. 먼저 터보레포의 [Create a new monorepo](https://turbo.build/repo/docs/getting-started/create-new)를 참조해보자.

```sh
pnpm dlx create-turbo@latest
```

위 명령어를 통해 모노레포 스캐폴딩을 설치한다. 스캐폴딩이 구성될 디렉토리명을 입력하고 워크스페이스를 선택한다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/b8cbef6e-3e95-4774-b262-4558201076b6)

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/a0b61913-226b-487f-86e0-add5039aa814)

모노레포를 생성하면 apps, packages 디렉토리를 비롯한 파일들이 하나의 코드베이스에 생성된다. 두 디렉토리는 모노레포의 workspace에 해당한다. 루트 디렉토리의 `pnpm-workspace.yaml` 을 열어보면 yaml 문법으로 두 디렉토리가 workspace로 선언되어 있는 것을 확인할 수 있다.

```sh
packages:
  - "apps/*"
  - "packages/*"
```

최상단 디렉토리 `./`는 **루트 워크스페이스(Root Workspace)** 가 되고, `apps/*`, `packages/*`는 **로컬 워크스페이스(Local Workspace)** 가 된다. workspace 내에 위치한 프로젝트나 패키지들은 각각 `package.json`을 통해 관리된다.

`package.json`의 `name` 프로퍼티에 적힌 이름은 다른 프로젝트나 패키지의 디펜던시명이 되기 때문에, 모노레포를 구현하려면 `package.json`도 어느정도 다룰 수 있어야 한다. `package.json`에 대해 잘 정리된 [블로그 글](https://www.daleseo.com/js-package-json/)을 공유하니 개념이 헷갈린다면 한번 정독하고 오자. 모노레포 구성을 위해 반드시 알아야할 `package.json` 프로퍼티 목록은 아래와 같다.

- name
- main
- dependencies
- devDependencies
- script

워크스페이스 개념은 고정된 개념이 아니다. `pnpm-workspace.yaml`을 수정하여 workspace를 추가하거나 삭제할 수 있고, 이름 변경도 가능하다. 이에 대해서는 위에 언급한 [모노레포 핸드북](https://turbo.build/repo/docs/handbook)에 자세히 나와있다.

### 패키지 구조 설계

모노레포는 주어진 상황별로 구축 방식이 달라진다. 본인의 니즈를 구체화한 후 가이드를 따라오도록 하자. 가이드에서는 루트 패키지를 설계한 후 프로젝트를 추가하고, 각종 패키지를 만들어 프로젝트에 적용해 볼 것이다.

#### 루트 패키지 설계

루트 패키지에 어떤 것을 추가할 지 본인의 니즈를 구체화해보자.

- 예시

  1. 내가 주력으로 사용하는 프레임워크는 next이다. 모노레포 내 모든 프로젝트는 next를 사용할 것이다.
  2. next은 react와 react-dom에 의존한다.
  3. typescript는 필수이다.
  4. 간편하고 빠른 스타일 설정을 위해 tailwind를 사용할 것이다. tailwind 설정에는 autoprefixer, postcss가 필수적이다.
  5. 공용 UI 패키지도 next, tailwind, typescript를 사용할 것이다.
  6. 따라서 next, react, react-dom, tailwind, autoprefixer, postcss를 전역에 설치할 것이다.
  7. 필요한 @types도 설치해야 한다.

따라서 루트 패키지에 설치할 디펜던시는 아래와 같다.

```sh
pnpm install next@latest react@latest react-dom@latest typescript@latest -w
```

```sh
pnpm install -D @types/node @types/react @types/react-dom -w
```

(pnpm의 경우에는 루트 디렉토리에 디펜던시를 설치할 때 `-w` 플래그를 붙여주어야 한다.)

여기서부터는 아무 생각없이 따라오게되면 분명히 망하게 된다. 내가 어떤 행위를 하고 있는 것인지 제대로 인지한 상태에서 차근차근 따라오도록 한다.

#### apps에 프로젝트 추가

모노레포 구축을 위해 프로젝트를 2개 정도 추가해보자. 프로젝트는 컨벤션 상으로 apps 디렉토리에 추가하고 관리한다. 터보레포 스캐폴딩으로 모노레포를 구성했다면 디폴트 프로젝트가 2개 (`apps/docs`와 `apps/web`) 있을 것인데, 필요없으니 모두 지워준 후 새로운 프로젝트를 설치한다. 나는 `/apps` 경로로 이동한 후 CLI에

```sh
pnpm create next-app@latest
```

를 입력하여 next.js 프로젝트를 2개 (`my-app-1`, `my-app-2`) 설치하였다. 세부사항 셋팅은 아래와 같이 진행했다.

```
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like to use `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to customize the default import alias (@/*)? ... No
```

만약 수동으로 프로젝트를 구축해야한다면 기존의 폴리레포에서 프로젝트를 만들던 방식으로 `apps`에 디렉토리를 만들어 직접 구축하면 된다.

#### 타입스크립트 패키지 만들기

앞서, create-next-app 명령어를 통해 next.js를 기반으로 한 2개의 프로젝트 스캐폴딩을 만들었다. 두 프로젝트는 패키지 명 외에 모든 것들이 같을 것이다. 코드의 통일성을 위해 합칠것들은 합쳐보자. 먼저 각 프로젝트의 타입스크립트 설정을 `packages workspace`에 묶어보자.

터보레포 스캐폴딩으로 모노레포를 구성하면 `packages` 디렉토리에 `typescript-config`, `eslint-config`, `ui` 패키지가 기본적으로 생성된다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/c9c6369d-4f20-4b19-a0ff-b1461781ef85)

기본 설정을 사용하지 않겠다면 모두 지워도 상관없다. 일단 나는 타입스크립트 패키지의 next.js 설정만 바꾸기를 원하므로, next.js 프로젝트의 `tsconfig.json` 내용을 복사해서 `packages/typescript-config/nextjs.json`에 붙여넣기 했다.

```json
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
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

(만약 위의 코드가 어떤 역할을 하는지 잘 모른다면 `tsconfig`의 정의와 프로퍼티에 대해 한번 훑어보는게 좋다. 나는 이 [블로그](https://inpa.tistory.com/entry/TS-%F0%9F%93%98-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-tsconfigjson-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-%EC%B4%9D%EC%A0%95%EB%A6%AC)를 참조하였다.)

패키지는 어려운 개념이 아니다. 코드와 함께 `package.json`이 존재하는 디렉토리 자체가 패키지가 된다. 즉 우리는 타입스크립트 설정에 관련된 패키지를 방금 막 만든 것이다. 만든 패키지를 프로젝트에 설치해보자.

적용은 `my-app-1` 프로젝트를 기준으로 할 것이다. `apps/my-app-1` 디렉토리에 이동한 후 CLI에 아래 명령어를 입력한다.

```sh
pnpm i -D @repo/typescript-config
```

**위 명령어는 워크스페이스 내 패키지 네임이 `@repo/typescript-config` 인 것을 추적하여 프로젝트 패키지에 개발용 디펜던시로 등록한다.**

명령어가 정상적으로 동작했다면 프로젝트의 `package.json`에 아래와 같이 `devDependencies`에 추가되었을 것이다.

```json
{
  // ...
  "devDependencies": {
    "@repo/typescript-config": "workspace:^"
    // ...
  }
}
```

패키지 설치가 완료되었다면 프로젝트의 `tsconfig.json` 설정을 아래와 같이 바꿔준다.

```json
// apps/my-app-1/tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json", // nextjs.json 확장
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

이로써 `packages/typescript-config/nextjs.json`의 코드를 일부 사용하면서도 프로젝트 별로 세부적인 셋팅을 할 수 있게 되었다. 만약 공용 설정을 바꿔야한다면 패키지 내 코드를 수정하면 될 것이다.

#### 테일윈드 패키지 만들기

디자인 관련 설정도 모노레포 패키지를 통해 효과적으로 관리할 수 있다.

나는 모든 프로젝트에 테일윈드를 사용할 것이므로 테일윈드 관련 설정을 패키지로 분리할 것이다. 먼저 `packages` 디렉토리에 `tailwind-config` 디렉토리를 생성한 뒤 `package.json`와 `index.ts`를 생성한다.

`package.json`은 아래와 같이 작성한다.

```json
// packages/typescript-config/package.json
{
  "name": "@repo/tailwind-config",
  "main": "./index.ts"
}
```

이후 `index.ts`에 프로젝트에 전반적으로 요구되는 공통 설정들을 자유롭게 작성하면 된다. 나는 `shadcn/ui`의 테일윈드 디폴트 설정을 복사해서 옮겨놓았다.

```typescript
// packages/typescript-config/index.ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

기본 설정이 완료되었다.

이제 테일윈드 기본설정이 필요한 프로젝트에 해당 패키지를 설치해준 뒤 이용하면 된다. 단, 테일윈드는 개발디펜던시가 아니라는 점을 명심하도록 하자.

```sh
/* 테일윈드 패키지를 사용할 프로젝트의 경로에 해당 명령어를 입력한다. */
pnpm i @repo/tailwind-config
```

디펜던시 설치가 완료되었다면, 설치한 디펜던시를 프로젝트 자체의 `tailwind.config.ts`에 import한다. 이후 객체 구조분해할당을 이용해 개별적인 셋팅을 추가로 진행한다.

```typescript
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

#### 린트 설계(전역 설정)

한번의 린트 설정으로 여러개의 프로젝트를 관리할 수 있다는 점이 어찌보면 모노레포의 가장 큰 장점(?)이지 않을까 싶다. 린트 설정도 차근차근 하다보면 어렵지 않다.

1. 만약 모든 프로젝트에 아래의 린트와 프리티어를 적용하고 싶다고 가정해보자.

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
    "prettier"
  ]
}
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "endOfLine": "auto"
}
```

2. 전역 설정이 필요하므로 린트와 프리티어에 필요한 디펜던시를 루트 워크스페이스에 설치한다.

```sh
/* 모노레포의 루트에 설치한다. */
pnpm i -D eslint eslint-config-next eslint-plugin-tailwindcss prettier -w
```

3. 프로젝트의 린트/프리티어 동작은 프로젝트로부터 트리구조 상 가까운 부모에 있는 `.eslintrc.json` 와 `.prettierrc` 를 따르므로 두 파일을 루트 워크디렉토리에 작성해두면 전역 린트 설정이 완료된다.

#### UI 패키지 만들기

이번에는 `packages` 워크스페이스에 공용 UI 패키지를 만들어보자. 아마 이 가이드에서 가장 까다로운 작업이 되지 않을까 싶다. 공용 UI는 요즘 인기가 좋은 `shadcn/ui`(https://ui.shadcn.com/)으로 구축할 예정이다.

`shadcn/ui`는 패키지로 제공되지 않는 리액트 기반 **컴포넌트**이다. 따라서 모노레포에서 이용하려면 직접 패키지로 말아야 한다.

먼저 기존 스캐폴딩에 의해 생성된 `./packages/ui` 디렉토리 내부의 파일들을 지운 뒤, `package.json`을 다시 만들자.

`./packages/ui` 경로의 CLI에

```sh
pnpm init
```

을 입력하면 자동으로 `package.json`이 만들어진다. json 파일을 열어 아래처럼 입력해주자.

```json
// ./packages/ui/package.json
{
  "name": "@repo/ui",
  "main": "./index.ts"
}
```

UI 패키지 선언이 완료되었다.

이제 A-Z 순으로 차근차근 설정해보자. 먼저 [공식문서](https://ui.shadcn.com/docs/installation/manual)를 통해 `shadcn/ui`의 사용에 필요한 디펜던시와 타입스크립트 설정을 확인해본다. shadcn/ui 사용을 위해서는 아래 디펜던시가 필요하다.

- react, react-dom
- tailwind, postcss, autoprefixer
- typescript (optional)

우리는 루트 워크스페이스에 react, tailwind, tailwind 관련 디펜던시와 모두 깔아두었으므로 UI 패키지에 디펜던시를 새로 설치해줄 필요는 없다. 알아서 루트 워크스페이스의 디펜던시를 참조할 것이기 때문이다. 디펜던시 설치는 생략하고 `tsconfig` 설정과 `tailwind`, `postcss` 설정만 해주자.

1. tsconfig.json 셋팅

전반적인 타입스크립트 관련 셋팅 방법은 앞서 봤던 [타입스크립트 패키지 만들기](#타입스크립트-패키지-만들기)를 참고하자.

```
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["./src/*"]
    }
  },
  "include": ["."],
  "exclude": ["node_modules"]
}
```

(`shadcn/ui` 설정으로 인해 `paths` 부분이 좀 다르다. 왜 다른지는 추후에 설명하도록 하겠다.)

2. 테일윈드 셋팅

테일윈드 기본 설정을 위해 `./packages/ui` 디렉토리에 `postcss.config.js` 파일과 `tailwind.config.ts` 파일을 생성한다.

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

테일윈드 설정은 `shadcn/ui` 공식문서의 기본 설정을 따왔다.

3. `shadcn/ui` 설치

테일윈드와 `tsconfig.json` 셋팅이 완료되었다면 본격적으로 `shadcn/ui`를 설치해보자.

`packages/ui` 경로에 아래 CLI 명령어를 입력해주자.

```sh
pnpm dlx shadcn-ui@latest init
```

선택 옵션이 나오는데 나는 아래와 같이 셋팅하였다.

```sh
√ Would you like to use TypeScript (recommended)? ... no / yes
√ Which style would you like to use? » Default
√ Which color would you like to use as base color? » Slate
√ Where is your global CSS file? ... ./globals.css
√ Would you like to use CSS variables for colors? ... no / yes
√ Are you using a custom tailwind prefix eg. tw-? (Leave blank if not) ...
√ Where is your tailwind.config.js located? ... tailwind.config.ts
√ Configure the import alias for components: ... @ui/shadcn ★
√ Configure the import alias for utils: ... @ui/lib/utils ★
√ Are you using React Server Components? ... no / yes
√ Write configuration to components.json. Proceed? ... yes
```

별표(★) 쳐진 부분은 `tsconfig.json`의 `paths`와 연관이 있다.

```

`paths`의 `@ui/`는 `./src/*`를 의미한다.

따라서 `@ui/shadcn`은 `./src/shadcn`가 되고

`@ui/lib/utils`는 `./src/lib/utils`가 된다.
```

셋팅이 되었다면 button 컴포넌트를 다운로드 받아보자. `packages/ui` 경로에서 아래 명령어를 입력한다.

```sh
pnpm dlx shadcn-ui@latest add button
```

button 컴포넌트 다운로드가 잘 됐다면 디렉토리 구조가 아래와 같이 되었을 것이다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/117180a7-c3fe-41a5-b090-a2c6c8ff8756)

`shadcn/ui`의 컴포넌트는 어느정도 정해진 css 스타일이 있으므로 `shadcn/ui`를 설치했을 때 자동으로 생성된 `globals.css`를 사용해야 한다. 해당 스타일을 별도의 패키지로 만들어 사용하거나, 프로젝트의 globals.css에 옮겨 사용하자.

```css
/* globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

또한 shadcn/ui는 스타일 표현을 위해 반드시 테일윈드 컴파일링이 필요하다. 따라서 프로젝트 내 `tailwind.config.ts`의 `content` 경로도 일부 수정되어야 한다.

```ts
const config: Config = {
  // ...
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}", // 1번
    "./node_modules/@repo/ui/src/**/*.{js,ts,jsx,tsx,mdx}", // 2번
    "./**/*.{js,ts,jsx,tsx,mdx}", // 아니면 모든 경로를 테일윈드로 밀어버리기
  ],
  // ...
};

export default config;
```

1번은 @repo/ui를 전역에 설치했을 때의 경로이고, 2번은 프로젝트 내부에 @repo/ui를 설치했을 때의 경로이다. 둘 중 상황에 맞는 경로를 사용하면 된다. 둘 다 애매하다면 그냥 테일윈드로 모두 밀어버려라.

경로 문제가 하나 더 남아있다. `경로 별칭(alias)`(/@ui 등)은 패키지가 특정 프로젝트의 디펜던시 형태로 존재할때는 제대로 동작하지 않는다. 우리는 `shadcn/ui`을 패키지로 만들어 사용할 것이므로, 경로 에러를 없애기 위해서 컴포넌트에 있는 모든 경로 별칭을 빼주어야 한다.

앞서 다운로드한 `packages/ui/shadcn/ui/button.tsx`에 있는 경로 별칭을 아래와 같이 수정해주자.

```js
import { cn } from "@/lib/utils";
```

위처럼 되어있는 경로를 아래처럼 바꿔주자.

```js
import { cn } from "../../lib/utils";
```

경로 수정이 완료되었다. 이제 거의 다 왔다.

마지막으로, 자동완성 기능을 위해 ui의 메인 디렉토리에 `index.tsx`를 만들어 아래와 같이 작성해주자.

```ts
export * from "./src/shadcn/ui/button";
```

우리는 앞서 ui의 `package.json` `main` 프로퍼티를 `./index.tsx`로 해두었다. 모든 export에 대해 `index.tsx`로 경유시키면 UI 패키지를 디펜던시로 사용하는 프로젝트에서 자동완성 기능을 사용해 컴포넌트를 import 할 수 있다. UI 패키지에서 새롭게 생성되는 모든 컴포넌트들은 `index.tsx`에 추가해주자. 이 과정을 통해 우리는 아래와 같은 자동완성 기능을 사용할 수 있게 된다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/edb22387-b53d-4ced-9bee-6a67c7fbb651)

---

## 부록(혼자서도 잘해요)

혼자서도 잘해요 시리즈

### 공용 css 패키지화 하기

- `globals.css`를 비롯해 프로젝트에서 공통적으로 사용할 css를 패키지화해서 관리해보세요.
- next.js의 `RootLayout` 관련 지식과 `tailwind`의 `@import` 기능에 대한 이해가 추가로 필요합니다.

### vercel, docker로 배포해보기

- 모노레포로 만든 프로젝트를 배포해보세요.
- Vercel로 배포하는 방법과 Docker로 배포하는 방법 모두 Turborepo의 공식문서에 기록되어 있답니다.

### 터보레포의 부가적인 기능

터보레포 빌드툴의 부가적인 기능에 대해 배워보고 하나씩 적용해보세요.

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
