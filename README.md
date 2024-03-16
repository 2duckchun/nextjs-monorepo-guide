# 모노레포 가이드

레퍼런스가 하도 없어 직접 작성하는 모노레포 가이드이다.

사실 본인의 상황에 100% 맞는 모노레포 관련 레퍼런스는 찾기 어렵다. 모노레포는 사랑과 우정같은 추상적인 개념이며 세부 구현 방법은 사용자마다 달라질 수 밖에 없기 때문. 그런 이유로 각자 상황에 맞는 구현을 하는 것이 올바른 방향인데, 기본적으로 디펜던시와 패키지, 린트, 타입스크립트, 테일윈드 등 설정(config)에 대한 이해도가 어느정도 받쳐줘야하기 때문에 진입장벽이 상당히 높다. 즉, 모노레포 자체는 별게 없지만 막상 구현하려고 보면 처리해야할 것들이 고구마 줄기마냥 우수수 뽑혀나온다. 하지만 겁먹을 것 없다. 하나씩 처리하면 될 일이다.

하여 이 가이드에서는 모노레포를 자유자재로 구현하기 위해 알아야하는 사전지식 및 키워드를 공부할 수 있는 레퍼런스를 공유하고, 모노레포를 구현하기 위한 사고 방식 및 간단한 구현 코드를 제공한다.

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
     - [프로젝트 추가](#프로젝트-추가)
     - [린트 패키지 설계](#린트-패키지-설계)
     - [스타일 패키지 설계](#스타일-패키지-설계)
     - [테일윈드 패키지 설계](#테일윈드-패키지-설계)
     - [UI 패키지 설계](#ui-패키지-설계)
4. [부록](#부록)
   1. [고찰](#고찰)
      - [테일윈드 인텔리센스 고장 해결](#테일윈드-인텔리센스-고장-해결)
      - [빌드 속도 개선에 관한 고찰](#빌드-속도-개선에-관한-고찰)
   2. [터보레포의 부가적인 기능](#터보레포의-부가적인-기능)

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

**모노레포에서 중시되는 것은 패키지와 프로젝트의 관계** 일 것이다. 워크스페이스에 있는 코드들이 알맞은 관계를 구성해서 코드의 재사용성을 크게 높힐 수 있어야 잘 구축된 모노레포라고 할 수 있지 않을까.

(모노레포 개념 자체가 어렵지 않은 개념이라 구체화 할 것도 없는 듯)

## 용어정의

본격적인 구현 전에 용어의 정의를 확실히 할 필요가 있다. 모노레포의 특성상 하나의 저장소에 여러개의 패키지와 디펜던시가 뒤엉킬 것인데, 패키지가 뭔지, 디펜던시가 어떤건지에 대해 정의를 정확히 모르면 구현에 애를 먹을 수 있다. 다행히 모노레포에서 다룰 용어들에는 어려운 개념이 없다. 모노레포 구현을 직접 시도해볼만한 정도라면 패키지매니저, 디펜던시, 패키지, 라이브러리 등의 정의를 어느정도 알고 있을 것이다. 그럼에도 불구하고 모노레포 구현에 사용되는 용어를 한번 더 정의해보자.

- **라이브러리(library)**

  - 재사용 가능한 코드의 집합으로, 특정 기능을 수행하기 위한 함수, 클래스, 모듈 등이 포함된다.
  - 라이브러리는 주로 패키지의 일부로 제공되며, 다른 프로젝트에 호출되어 사용할 수 있다.
  - 자바스크립트 생태계에서는 라이브러리를 패키지화해서 npm에 공유하고 있다.
  - 즉, npm에 배포된 라이브러리는 패키지화를 거친 것으로 볼 수 있다.

- **패키지(package)**

  - 넓게는 특정 소프트웨어, 좁게는 재사용 가능한 코드를 배포하거나 공유하기위해 **번들링**한 것을 말한다.
  - 주 목적은 어디까지나 배포나 공유를 용이하게 하기 위함이며, 다른 프로젝트에서 재사용이 가능하도록 모듈화되어 있어야 한다.

- **디펜던시(dependency)**

  - 어떤 패키지나 라이브러리가 다른 패키지에 종속되어있는 상태를 나타낸다.
  - 즉, 특정 패키지나 라이브러리를 사용하기 위해 선행적으로 설치되어야 하는 패키지라고 정의할 수 있다

- **패키지 매니저(package manager)**

  - 소프트웨어 개발에 사용되는 도구로 프로젝트에 필요한 디펜던시를 관리하는데 사용된다.
  - 패키지 매니저를 이용해 패키지 설치, 디펜던시 관리, 버전관리 등을 편리하게 이용할 수 있다.
  - 대표적인 패키지 매니저로는 **npm**, **yarn**, **pnpm** 등이 있다.

- **워크스페이스(workspace)**
  - 직역하면 협업공간 이다. = 패키지들이 협업하는 공간
  - 워크스페이스는 디렉토리의 개념으로, 다양한 소스코드와 자원들을 관리하는 공간이다.
  - 코드 자원을 관리하는 공간이므로 **모노레포의 핵심**이라고 할 수 있다.

## 구축해보기

본격적으로 구축하기에 앞서 모노레포에 관해 실용적인 측면에서 자세히 설명되어있는 터보레포 공식문서의 [모노레포 핸드북](https://turbo.build/repo/docs/handbook)을 읽어보자.

모노레포의 구현이 처음이라면 한번 읽어보는 것을 추천한다. 이 가이드는 위의 공식문서에 기술된 내용을 어느정도 아는 것을 전제로 진행된다.

### 패키지매니저 선택

모노레포를 구축하기전에 사용할 패키지매니저를 골라보자. 사용할 패키지매니저는 모노레포 구축을 위해 워크스페이스 기능을 반드시 제공해야 한다. 다행히도 자바스크립트 생태계의 메이저 패키지매니저들은 모두 workspace 기능을 제공한다.

- yarn
- **pnpm** ← 나의 선택
- npm
- bun

나는 주로 pnpm을 애용한다. npm에 비해 속도도 빠르고, npm에서 pnpm으로 마이그레이션하는 것도 편하다. 물론 반드시 pnpm을 사용할 필요는 없다. 본인이 사용하고싶은 패키지매니저를 사용하면 된다.

그래도 딱히 패키지매니저에 대한 고집이 없다면 pnpm을 한번 사용해보자. [여기](https://pnpm.io/installation)를 참고해서 각 OS 설치방법에 맞게 pnpm을 설치하고, pnpm 공식문서를 간단하게 훑어보자.

패키지매니저들은 각기 다른 workspace 선언 방식을 가진다. 다음 스텝으로 넘어가기 전에 선택한 패키지매니저의 workspace 선언 방식에 대해 살짝 공부하고 넘어가자. pnpm의 경우에는 [workspace 공식문서](https://pnpm.io/workspaces)에서 확인할 수 있다.

### 터보레포 스캐폴딩 설치

위에 언급했던 공식문서를 정독했다면 모노레포 빌드 툴 없이 패키지매니저만 이용해서 모노레포를 구축할 수 있을 것이다. 하지만 필요한 기능들을 모두 구현하기엔 시간이 많이 걸릴 것이다.

시간이 많다면 직접 모든 것을 구현하는 것도 나쁘지는 않겠지만, 그럴 여유가 없다면 고민할 시간을 덜어줄 수단으로 빌드 툴을 이용하여 모노레포 스캐폴딩을 설치해보자.

나는 빌드 툴로 터보레포를 쓰려고 한다. 모노레포 빌드 툴에는 여러가지가 있는데, 그 중 터보레포가 러닝커브 곡선이 완만하다는 평이 있다. 무엇보다 버셀이 인수해서 앞날이 좀 창창한 친구이다.(...)

터보레포로 프로젝트를 인스톨하면 next.js를 기반으로 한 모노레포 스캐폴딩이 제공된다. 제공된 스캐폴딩의 구조를 직접 뜯어서 모노레포 구현법을 스스로 체득하는 것도 권장할만한 방법이다.

그렇다면 터보레포로 쓸만한 모노레포를 구현해보자. 먼저 터보레포의 [Create a new monorepo](https://turbo.build/repo/docs/getting-started/create-new)를 참조하면서 가이드를 이어나가자.

먼저 아래 명령어를 이용해 모노레포 스캐폴딩을 설치해보자.

```sh
pnpm dlx create-turbo@latest
```

명령어를 입력하면 아래 두가지 단계를 거쳐 모노레포가 설치된다.

1. 프로젝트 명 입력
2. 사용할 패키지매니저 선택

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/b8cbef6e-3e95-4774-b262-4558201076b6)

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/a0b61913-226b-487f-86e0-add5039aa814)

생성된 모노레포 스캐폴딩을 보면 apps, packages 디렉토리를 비롯한 파일들이 하나의 코드베이스에 묶여있는 것을 확인할 수 있다. 두 디렉토리는 모노레포의 `로컬 워크스페이스(local workspace)`에 해당한다. 루트 디렉토리의 `pnpm-workspace.yaml` 을 열어보면 yaml 문법으로 두 디렉토리가 `workspace`로 선언되어 있는 것을 확인할 수 있다. 루트 디렉토리는 `루트 워크스페이스(root workspace)`가 된다.

```sh
packages:
  - "apps/*"
  - "packages/*"
```

다음으로 `package.json`에 대해 조금 더 알아보는 시간을 가져보자. 아래는 `packages/eslint-config/package.json`이다.

```json
// packages/eslint-config/package.json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "files": ["library.js", "next.js", "react-internal.js"],
  "devDependencies": {
    "@vercel/style-guide": "^5.2.0",
    "eslint-config-turbo": "^1.12.4",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-only-warn": "^1.1.0",
    "@typescript-eslint/parser": "^7.1.0",
    "@typescript-eslint/eslint-plugin": "^7.1.0",
    "typescript": "^5.3.3"
  }
}
```

`package.json`에서 가장 중요한 것은 `name` 프로퍼티라고 할 수 있다. 패키지 이름이 곧 디펜던시명이 되기 때문이다. 또한 pnpm의 `--filter` 명령어를 걸 때의 기준점이 되기도 한다.

> pnpm --filter package-name command
> 설명 : --filter는 명령어를 특정 패키지의 하위집합에만 적용시킬 수 있게 해줍니다.
>
> > (ex) pnpm --filter my-app-1 install something

그 외에도 모노레포 구성을 하려면 반드시 알아야할 `package.json`의 프로퍼티가 있다. 이 주제에 대해 잘 정리된 [블로그 글](https://www.daleseo.com/js-package-json/)을 공유하니 개념이 헷갈린다면 한번 정독해보자.

모노레포 구성을 위해 알면 좋은 `package.json` 프로퍼티 목록은 다음과 같다.

- name
- main
- exports
- dependencies
- devDependencies

### 패키지 구조 설계

모노레포는 상황별로 구축 방식이 달라진다. 레포에 회사 전체 프로젝트를 몰아넣을 수도 있고, 어드민 산출물만 몰아넣을 수도 있다. 뭘 넣든 중요한건 개발자의 선택이다. 본인의 니즈를 구체화한 후 가이드를 따라오도록 하자. 가이드에서는 루트 패키지를 설계한 후 프로젝트를 추가하고, 각종 패키지를 만들어 프로젝트에 적용해 볼 것이다.

#### 루트 패키지 설계

루트 패키지에 어떤 것을 추가할 지 본인의 니즈를 구체화해보자.

- 나는 nextjs를 주력으로 사용한다. next는 react와 react-dom에 의존한다.
- 타입스크립트는 필수이다.
- **경험에 의해** @types 관련 디펜던시가 루트 워크스페이스에 설치되어야 함을 알고 있다.

따라서 루트 패키지에 설치할 디펜던시는 아래와 같다.

```sh
// next, react, 타입스크립트 관련 의존성
pnpm install next@latest react@latest react-dom@latest typescript@latest -w
```

```sh
// 타입 관련 의존성
pnpm install -D @types/node @types/react @types/react-dom -w
```

```sh
// 테일윈드 의존성
pnpm install -D tailwindcss postcss autoprefixer -w
```

> pnpm 루트 워크스페이스에 디펜던시를 설치할 때는 `-w` 플래그를 붙여주어야 한다.

모노레포에 어떤 패키지와 프로젝트가 들어갈지도 어림잡아 설계해보자. 설계대로 100% 되지는 않겠지만, 어느 정도의 설계가 있는 건 시행착오를 줄여준다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/25c3549e-7b83-4e46-82b6-2eef4241d50c)

(악필주의, 해석)

- 나는 모노레포에서 next, tailwind 프로젝트만 다룰 것이므로 기초적인 디펜던시는 root에 설치한다.
- apps와 packages 내 디펜던시는 개발하면서 차근차근 붙여나가면 된다.

#### 프로젝트 추가

이제 본격적으로 프로젝트를 설계해보자. 프로젝트는 컨벤션 상 `apps` 디렉토리에서 관리한다. 터보레포 스캐폴딩으로 모노레포를 구성했다면 디폴트 프로젝트로 `apps/docs`와 `apps/web`가 있을 것인데 필요없으니 모두 지워준 후 새로운 프로젝트를 설치한다.

```sh
pnpm create next-app@latest
```

나는 next.js 프로젝트 `my-app-1`, `my-app-2`을 설치하였다. 세부사항 셋팅은 아래와 같이 진행했다.

```
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like to use `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to customize the default import alias (@/*)? ... No
```

위의 설정으로 프로젝트를 설치하면 프로젝트마다 테일윈드(`tailwind.config.ts` 등)와 린트 설정 파일(`eslintrc.json`)이 자동적으로 생성된다. 자동 생성된 설정 파일을 기반으로 공통된 코드들을 모듈화해서 이식하는 방식으로 설정을 셋팅할 것이므로 지우지 말자.

#### 린트 패키지 설계

린트 패키지의 경우에는 내가 `extends`할 린트 패키지를 만든다는 개념으로 접근하면 쉽게 이해할 수 있다. 아니, 지금 할 일 자체가 린트 패키지를 만드는 작업이다.

나는 모노레포의 모든 next.js 프로젝트에 아래의 린트 설정을 사용하려고 한다.

```json
// packages/eslint-config/next.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier",
    "plugin:tailwindcss/recommended"
  ]
}
```

공용 린트 설정을 위한 디펜던시는 린트 패키지에 설치하고 관리해야한다. 나의 경우 아래의 디펜던시를 사용하려고 한다. @repo/eslint-config 패키지에 설치해주자.

- eslint-config-next
- prettier
- eslint-plugin-tailwindcss

```sh
pnpm --filter @repo/eslint-config install -D eslint-config-next eslint-plugin-tailwindcss prettier
```

`@repo/eslint-config`에만 eslint 관련 디펜던시를 설치할 것이므로 `--filter`를 활용한다. (`--filter`는 내가 지정한 패키지에만 명령어를 실행시킨다.)

디펜던시 추가가 완료되었따면 `package.json`를 손볼 차례다.

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.1.0",
    "@typescript-eslint/parser": "^7.1.0",
    "@vercel/style-guide": "^5.2.0",
    "eslint-config-next": "14.1.3",
    "eslint-config-prettier": "^9.1.0",
    "eslint-config-turbo": "^1.12.4",
    "eslint-plugin-only-warn": "^1.1.0",
    "eslint-plugin-tailwindcss": "^3.15.1",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3"
  }
}
```

필요없는 프로퍼티와 디펜던시는 삭제해줘도 좋다. 판단은 본인 몫이다. 패키지 설정이 완료되었다면 실제 프로젝트에 공용 린트를 적용시켜보자.

준비된 조교는 `my-app-1` 프로젝트이다. 방금 만든 `@repo/eslint-config` 패키지를 `my-app-1` 프로젝트에 설치해보도록 하자.

```sh
pnpm --filter my-app-1 install -D @repo/eslint-config
```

설치 이후, `my-app-1` 프로젝트의 `.eslintrc.json`에 방금 만든 패키지를 `extends` 한다.

```json
{
  "root": true, // 프로젝트별로 린트설정을 할 경우 root: true를 해줄 것
  "extends": ["@repo/eslint-config/next.json"]
}
```

이로써 `my-app-1` 프로젝트의 next.js 린트 설정이 끝났다. 적용 원리만 알면 다양한 바리에이션을 추가하는 것은 크게 어렵지 않을 것이다.

#### 스타일 패키지 설계

css도 패키지로 만들어 관리하면 유지보수성이 향상된다. 나는 아래 두개의 css를 패키지로 만들어 볼 것이다.

- shadcn.css : `shadcn/ui`의 디폴트 스타일
- palette.css : 프로젝트 전역에 사용할 컬러 팔레트

(`shadcn/ui`는 가이드에서 사용할 리액트 UI 컴포넌트이다. 사용하려면 몇가지 설정이 필요한데 그 중 하나가 `shadcn/ui`에서 제공하는 css를 쓰는 것이다. 이는 아래 UI 패키지 설계에서 더 상세히 설명한다.)

먼저 `packages` 워크스페이스에 `styles-config` 디렉토리를 생성하고 `pnpm init` 명령어를 이용해 `package.json`을 만든다.

다음으로 `shadcn.css` 파일과 `palette.css`을 생성한 뒤 각 파일에 필요한 스타일을 넣어준다. 나는 아래와 같이 추가해주었다.

```css
/* shadcn.css */

@tailwind base;

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

```css
/* palette.css */

@tailwind base;

@layer base {
  :root {
    --app-blue-001: #ebf3ff;
    --app-blue-002: #4674fe;
    --app-blue-background: #fafcff;

    --app-gray-001: #ffffff;
    --app-gray-002: #f5f5f5;
    --app-gray-003: #e9eaee;
    --app-gray-004: #cccccc;
    --app-gray-005: #c4c4c4;
    --app-gray-006: #b6b7b9;
    --app-gray-007: #888888;
  }
}
```

이 css 파일들은 프로젝트의 `node_modules` 에 설치되어 프로젝트의 메인 css(`globals.css`)에 `@import` 될 것이다.

위의 기능을 구현하기 위해 `package.json` 을 수정해주자.

```json
{
  "name": "@repo/styles-config",
  "version": "0.0.0",
  "license": "MIT",
  "exports": {
    "./shadcn": "./shadcn.css",
    "./palette": "./palette.css"
  }
}
```

`exports`에 주목해보자. `exports`에 필요한 값을 잘 명시해놓으면 패키지의 특정 파일을 프로젝트에 `import`하기 쉬워진다.

예를 들어 아래와 같이 `import` 할 수 있다.

```ts
import "@repo/styles-config/shadcn";
```

아직 처리할 것이 남았다. 우리가 스타일 패키지에 작성한 css에는 `@base` 등과 같은 비표준 키워드가 있다. 이것에 관련된 처리를 해주지 않고 프로젝트 전역 css에 패키지를 `import`하면 빌드 단계에서 오류가 난다.

우리는 이 문제를 `postcss.config.js`를 이용해 쉽고 간편하게 해결할 수 있다. 테일윈드 [공식문서](https://tailwindcss.com/docs/using-with-preprocessors#build-time-imports)를 한번 살펴보자. 우리가 추가할 기능은 모듈별로 분리한 css와 메인 css를 빌드 타임에 결합할 수 있게 만들어준다.

공식문서에서 설명하는대로 `postcss-import` 플러그인을 `my-app-1` 프로젝트에 설치한 후 `postcss.config.js`에 플러그인으로 추가해주자.

```sh
pnpm --filter my-app-1 install -D postcss-import
```

```js
// apps/my-app-1/postcss.config.js
module.exports = {
  plugins: {
    "postcss-import": {}, // 최상단에 추가(공식문서를 읽어보자)
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

이로써 스타일 패키지 적용에 대한 모든 사전 작업이 끝난다. 해당 스타일 패키지를 프로젝트에 의존성으로 추가한 후 메인 css에 필요한 스타일을 `import` 해보자.

```css
/* apps/my-app-1/src/app/globals.css */
/* import문은 최상단에 있어야 한다. */
@import "@repo/styles-config/shadcn";
@import "@repo/styles-config/palette";

/* 이 부분은 프로젝트별 추가 확장을 위해 남겨두었다. */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

여기까지의 과정을 잘 따라왔다면 정상적으로 동작할 것이다.

#### 테일윈드 패키지 설계

테일윈드 설정도 모듈로 만들어보자. 앞서 만들었던 스타일 패키지와 비슷하게 2개의 테일윈드 설정을 패키지로 만들 것이다.

- shadcn.js : `shadcn/ui`의 디폴트 테일윈드 스타일
- palette.js : 프로젝트 전역에 사용할 테일윈드 팔레트

먼저 `packages` 워크스페이스에 `tailwind-config` 디렉토리를 생성하고 `pnpm init` 명령어를 이용해 `package.json`을 만든다.

다음으로 `shadcn.js` 파일과 `palette.js`을 생성한 뒤 각 파일에 필요한 스타일을 넣어준다. 나는 아래와 같이 추가해주었다.

```js
// packages/tailwind-config/shadcn.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
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
        "bubble-gum": "#ff77e9",
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
};
```

```js
// packages/tailwind-config/palette.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        app: {
          blue: {
            "001": "#ebf3ff",
            "002": "#4674fe",
            "blue-background": "#fafcff",
          },
          gray: {
            "001": "#ffffff",
            "002": "#f5f5f5",
            "003": "#e9eaee",
            "004": "#cccccc",
            "005": "#c4c4c4",
            "006": "#b6b7b9",
            "007": "#888888",
          },
        },
      },
    },
  },
};
```

`package.json`은 아래와 같이 작성한다.

```json
// packages/tailwind-config/package.json
{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "license": "MIT"
}
```

테일윈드 패키지는 `tailwind.config.ts`에 추가할 것이므로, `css`에 `import`하는 것과 같은 `exports` 전처리를 굳이 하지 않아도 편하게 이용할 수 있다. 본인의 입맛따라 `package.json`을 구성해보자.

여기까지 되었다면 테일윈드 스타일 설정이 끝난 것이다. 만든 패키지는 my-app-1 프로젝트의 tailwind.config.ts에 `preset`으로 사용할 것이다. 먼저 테일윈드 스타일 디펜던시를 프로젝트에 추가한다.

```sh
pnpm --filter my-app-1 install @tailwind-config
```

이후 테일윈드의 `preset`에 패키지를 추가한다.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  presets: [
    require("@repo/tailwind-config/palette"), // preset 추가
    require("@repo/tailwind-config/shadcn"), // preset 추가
  ],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Graphik", "sans-serif"],
      },
    },
  },
};

export default config;
```

[tailwind](https://tailwindcss.com/docs/presets) 공식문서에서 `preset`의 사용 이유와 사용 방법을 자세히 확인할 수 있다. 이로써 테일윈드 설정도 마무리되었다.

#### UI 패키지 설계

이번에는 공용 UI 패키지를 만들어보자. 아마 이 가이드에서 가장 까다로운 작업이 되지 않을까 싶다. 공용 UI는 요즘 인기가 좋은 `shadcn/ui`(https://ui.shadcn.com/)으로 구축할 예정이다.

`shadcn/ui`는 패키지로 제공되지 않는 **리액트 기반 컴포넌트**이므로 모노레포에서 사용하려면 UI를 먼저 구축한 다음 구축한 UI로 패키지를 만들어야 한다. 앞서 진행했던 스타일 설정 및 테일윈드 설정과 절차가 비슷하다.

먼저 기존 스캐폴딩에 의해 생성된 `./packages/ui` 디렉토리 내부의 파일들을 전부 지운 뒤, `package.json`을 다시 만들자.

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

이제 이 패키지에 `shadcn/ui`를 설치하기 위해 셋팅을 조금 해야한다. `shadcn/ui`는 react, 테일윈드, postcss, autoprefixer에 의존성을 가진다. 이 의존성 파일들을 `./packages/ui`에 우선적으로 설치해줘야하지만 우리는 앞서 루트 패키지를 설계할 때 미리 다 깔아두었었다. 따라서 별도의 의존성 설치 과정을 거치지 않고 바로 테일윈드 셋팅을 해줄 수 있다. `/packages/ui` 디렉퇴에 위치한 다음 아래 명령어를 입력해주면 해당 패키지 위치에 테일윈드가 셋팅된다.

```sh
pnpx tailwindcss init -p
```

위 명령어를 입력하면 해당 패키지 위치에 `tailwind.config.js`와 `postcss.config.js`가 생성된다. 여기에 생성된 테일윈드 관련 설정은 건드릴 필요가 없다. 여기에 작성된 UI들은 프로젝트마다 설정된 `tailwind.config.ts`의 영향을 받게 될 것이기 때문이다.

이제 타입스크립트 셋팅을 해주자. ui 디렉토리에 `tsconfig.json`을 생성한 뒤 아래와 같이 코드해주었다.

```json
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
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@ui/*": ["./src/*"] // 이부분에 주목
    }
  },
  "include": ["."],
  "exclude": ["node_modules"]
}
```

`paths`의 `@ui/`는 `./src/*`를 의미하며, `shadcn/ui`을 설치할 때 경로 문제를 해결하기 위해 필요한 부분이다.

테일윈드와 tsconfig.json의 셋팅이 끝났다면 `shadcn/ui`를 설치하자.

테일윈드와 `tsconfig.json` 셋팅이 끝났다면 본격적으로 `shadcn/ui`를 설치해보자.

`packages/ui` 경로에 아래 CLI 명령어를 입력해주자.

```sh
pnpm dlx shadcn-ui@latest init
```

선택 옵션이 나오는데 나는 아래와 같이 셋팅해주었다.

```bash
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

> `paths`의 `@ui/`는 `./src/*`를 의미한다.
>
> > `@ui/shadcn`은 `./src/shadcn`가 되고
> > `@ui/lib/utils`는 `./src/lib/utils`가 된다.

셋팅이 되었다면 button 컴포넌트를 다운로드 받아보자. `packages/ui` 경로에 위치한 다음, 아래 명령어를 입력해본다.

```sh
pnpm dlx shadcn-ui@latest add button
```

button 컴포넌트 다운로드가 잘 됐다면 디렉토리 구조가 아래와 같이 되었을 것이다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/117180a7-c3fe-41a5-b090-a2c6c8ff8756)

이후에는 `shadcn/ui`의 기본 css와 테일윈드 셋팅을 해주어야 하는데 사전에 프로젝트에 `shadcn/ui` 대한 설정을 모두 마쳤으므로 별도로 셋팅할 필요가 없다.

다만 shadcn/ui는 스타일 표현을 위해 반드시 테일윈드 컴파일링이 필요하다는 것을 인지하도록 하자. 이를 위해 프로젝트 내 `tailwind.config.ts`의 `content` 경로가 일부 수정될 필요가 있다.

```ts
// apps/my-app-1/tailwind.config.ts

const config: Config = {
  // ...
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...
};

export default config;
```

테일윈드는 content의 배열 내 경로를 탐색하여 테일윈드 스타일을 브라우저가 인지할 수 있게 파싱한다. 즉, 프로젝트의 테일윈드 설정이 package/ui를 한번 경유해야만 ui에 테일윈드 스타일링이 제대로 먹히게 된다.

제대로 된 정보는 테일윈드 공식문서 중 [content-configuration](https://tailwindcss.com/docs/content-configuration)을 참조하자.

경로 문제가 하나 더 남아있다. **경로 별칭(alias)**(`/@ui` 등)은 패키지가 특정 프로젝트의 디펜던시 형태로 있을때는 제대로 동작하지 않는다. 우리는 `shadcn/ui`을 패키지로 만들어 사용할 것이므로, 추후 생길 경로 문제를 없애기 위해서 **컴포넌트에 있는 모든 경로 별칭을 빼줄 것이다.**

앞서 다운로드한 `packages/ui/shadcn/ui/button.tsx`에 있는 경로 별칭을 아래와 같이 수정해주자.

```js
// import { cn } from "@/lib/utils";
import { cn } from "../../lib/utils";
```

마지막으로, 자동완성 기능을 위해 ui의 메인 디렉토리에 `index.tsx`를 만들어 아래와 같이 작성해주자.

```ts
// 여기에도 경로 별칭이 있으면 안된다.
export * from "./src/shadcn/ui/button";
```

우리는 앞서 ui의 `package.json` `main` 프로퍼티를 `./index.tsx`로 해두었다. 모든 `export`를 `index.tsx`로 경유시키면 UI 패키지를 디펜던시로 사용하는 프로젝트에서 자동완성 기능을 사용해 컴포넌트를 import 할 수 있다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/edb22387-b53d-4ced-9bee-6a67c7fbb651)

UI 패키지에서 새롭게 생성되는 모든 컴포넌트들은 `index.tsx`에 추가해주자.

이제 모든 작업이 끝났다. UI 패키지를 이용할 프로젝트에 UI 패키지를 의존성으로 설치해주고 작업을 이어서 진행하면 된다.

---

## 부록

### 고찰

#### 테일윈드 인텔리센스 고장 해결

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/225cfc54-4245-4e13-a656-d052f39139b2)

테일윈드 인텔리센스는 모노레포에서 작업할 때마다 고장난다. 테일윈드 인텔리센스 자체가 VSCode에 종속된 기능이며, 동작 원리가 작업중인 디렉토리에 설치된 `tailwind.config.ts`를 따라 자동완성 기능을 제공하는 것이기 때문에 모노레포 최상단에서 작업을 하게되면 내 프로젝트가 사용하는 config 설정과 다른 자동완성 기능을 제공하게 된다.

따라서 프로젝트별로 셋팅된 테일윈드에 따른 자동완성 기능을 수행하기 위해서는 프로젝트 폴더 자체로 진입해서 VSCode를 열어야 한다.

![inteli](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/06e3dee7-7f79-4be9-9738-93f4101dc6fb)

VSCode가 개별 프로젝트 디렉토리를 바라보게 하면 인텔리센스가 잘 작동한다.

#### 빌드 속도 개선에 관한 고찰

dev 모드 작업 중 컴파일(빌드) 시간이 너무 느린 것 같다는 생각이 들었다. 물론 한번 컴파일링이 된 후에는 자동으로 `.next`이 캐싱되므로 매 작업마다 오래 기다릴 필요는 없다. 문제는 디펜던시가 수정될때마다 컴파일이 새롭게 이루어지므로, 초기 작업 셋팅 때는 시간을 많이 잡아먹을 수 있다.

나는 모노레포 내 프로젝트의 중복 코드 제거 및 디펜던시 버전 관리를 위해 next, react, react-dom과 같은 주요 디펜던시를 모두 루트 워크스페이스에 빼놓았었는데 이 방법이 초기 빌드 시간에 악영향을 주는 것 같았다.

아래 사진은 필요한 모든 종속성을 루트 워크스페이스에 설치했을 때의 컴파일 타임이다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/38f8cfa1-9e2a-4b65-b2dd-64bafb8cd507)

`my-app-2`는 46.1초, `my-app-1`은 47.8초가 걸렸다.

실험을 위해 `my-app-1`의 next, react, react-dom 등 주요 프레임워크 디펜던시를 프로젝트에 개별적으로 설치해본 뒤 다시 빌드를 진행해보았다. 결과는 아래와 같다.

![image](https://github.com/2duckchun/nextjs-monorepo-guide/assets/92588154/c8fd0a6f-d6aa-4467-a30a-6b7f0f5c6fe6)

`my-app-2`는 작업이 캐싱되었으므로 빨리 끝났고, `my-app-1`은 새롭게 빌드되었는데도 불구하고 빌드 시간이 약 11초 정도 빨라졌다.

이를 통해 모든 디펜던시를 루트 워크스페이스에 놓으면 코드 관리는 편할지 몰라도 작업 속도는 많이 늦어질 수 있다는 것을 알게 되었다.

초기 작업때는 각 프로젝트에서 디펜던시를 관리하다가 작업이 어느정도 마무리 된 이후에 루트 워크스페이스에서 버전 관리를 하면 될 것 같다.

### 터보레포의 부가적인 기능

터보레포 빌드툴의 부가적인 기능에 대해 배워보고 하나씩 적용해보세요.

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
