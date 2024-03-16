import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@repo/ui";
import QuillEditor from "@/components/quill-editor";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <h1 className="flex h-[50px] w-full items-center justify-center bg-app-blue-002/50 py-10 text-4xl font-semibold">
        my-app-1 project
      </h1>
      <p className="text-balance text-app-blue-002">깔라뿌이니</p>
      <div className="w-[500px]">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              모노레포 구현 프로젝트에 오신 것을 환영합니다.
            </AccordionTrigger>
            <AccordionContent className="text-app-blue-002">
              파이팅!!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <QuillEditor />
      <Button>배터꿀라띠따이</Button>
    </main>
  );
}
