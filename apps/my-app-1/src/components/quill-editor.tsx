"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const QuillEditorNoSSR = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function QuillEditor() {
  return (
    <div className="h-[400px] w-[700px]">
      <QuillEditorNoSSR theme="snow" className="h-[85%]" />
    </div>
  );
}
