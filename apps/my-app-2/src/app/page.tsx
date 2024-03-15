import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <h1 className="flex h-[50px] w-full items-center justify-center bg-app-blue-001/50 py-10 text-4xl font-semibold">
        my-app-2 project
      </h1>
      <div className="w-[500px]">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Lorem ipsum dolor sit.</AccordionTrigger>
            <AccordionContent>Lorem, ipsum dolor.</AccordionContent>
            <AccordionContent>Lorem ipsum dolor sit amet.</AccordionContent>
            <AccordionContent>
              Lorem ipsum dolor sit amet consectetur.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>로렘 입숨 달러 싯</AccordionTrigger>
            <AccordionContent>Lorem, ipsum dolor.</AccordionContent>
            <AccordionContent>Lorem ipsum dolor sit amet.</AccordionContent>
            <AccordionContent>
              Lorem ipsum dolor sit amet consectetur.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              consectetur adipisicing elit. Cumque, veritatis.
            </AccordionTrigger>
            <AccordionContent>Lorem, ipsum dolor.</AccordionContent>
            <AccordionContent>Lorem ipsum dolor sit amet.</AccordionContent>
            <AccordionContent>
              Lorem ipsum dolor sit amet consectetur.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
