"use client";

import { Check, ChevronDown, Copy, Download, TriangleAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useGetFormBySlug, useUpdateForm } from "~/hooks/api/form";

export default function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { form } = useGetFormBySlug(slug);
  const { updateFormAsync, isPending } = useUpdateForm(slug);

  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${window.location.origin}/form/${slug}`);
  }, [slug]);

  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Pulls the rendered <svg> markup, wraps it as a downloadable Blob.
  const downloadQR = (format: "svg" | "png" | "jpeg" = "svg") => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    if (format === "svg") {
      const serialized = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${slug}.svg`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      return;
    }

    // Rasterize via canvas for PNG / JPEG
    const size = 192;
    const scale = 3;
    const margin = 24 * scale;
    const serialized = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * scale + margin * 2;
      canvas.height = size * scale + margin * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, margin, margin, size * scale, size * scale);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${slug}.${format}`;
          a.click();
          URL.revokeObjectURL(url);
        },
        format === "jpeg" ? "image/jpeg" : "image/png",
        0.95,
      );
    };
    img.src = svgUrl;
  };

  return (
    <div className="px-6 py-6 max-w-2xl flex flex-col gap-6">
      {/* Unpublished warning */}
      {form && !form.isPublished && (
        <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/10 rounded-lg px-4 py-3">
          <TriangleAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-700">This form is not published</p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              Respondents won&apos;t be able to submit until you publish it.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            disabled={isPending}
            onClick={() => void updateFormAsync({ formId: form.id, isPublished: true })}
          >
            {isPending ? "Publishing..." : "Publish now"}
          </Button>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold mb-1">Share this form</h2>
        <p className="text-sm text-muted-foreground">
          Send the link or print the QR code wherever respondents will see it.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="share-url">Public link</Label>
        <div className="flex gap-2">
          <Input id="share-url" readOnly value={url} className="font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={copyLink} disabled={!url}>
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>QR code</Label>
        <div ref={qrRef} className="bg-white border rounded-lg w-fit p-4">
          {url ? <QRCodeSVG value={url} size={192} level="M" /> : <div className="w-48 h-48" />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="self-start" disabled={!url}>
              <Download />
              Download
              <ChevronDown className="size-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => downloadQR("svg")}>SVG</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadQR("png")}>PNG</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadQR("jpeg")}>JPEG</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
