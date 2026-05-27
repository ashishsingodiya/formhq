"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { resolveTheme, type ThemeConfig } from "@repo/themes";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Monitor,
  MoreHorizontal,
  Palette,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasEndings, CanvasField, CanvasWelcome } from "~/components/builder/canvas-field";
import { FieldSidebar } from "~/components/builder/field-sidebar";
import { PreviewModal } from "~/components/builder/preview-modal";
import { ThemeModal } from "~/components/builder/theme-modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import {
  useCreateField,
  useDeleteField,
  useGetFields,
  useGetFormBySlug,
  useUpdateField,
  useUpdateForm,
} from "~/hooks/api/form";
import { type FieldConfig } from "~/lib/field-config";
import { FIELD_TYPES, TYPE_LABELS, type FieldType } from "~/lib/field-types";
import { useDebouncedCallback } from "~/lib/use-debounced-callback";
import { cn } from "~/lib/utils";
import { defaultConfigForType } from "./default-config";

type ActiveSlide = "welcome" | string | "endings";

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  const { form, isLoading: formLoading } = useGetFormBySlug(slug);
  const formId = form?.id ?? "";

  const { fields, isLoading: fieldsLoading } = useGetFields(formId);
  const { updateFormAsync, isPending: formSaving } = useUpdateForm(slug);
  const { createFieldAsync } = useCreateField();
  const { updateFieldAsync, isPending: fieldSaving } = useUpdateField(formId);
  const { deleteFieldAsync } = useDeleteField(formId);

  const [activeSlide, setActiveSlide] = useState<ActiveSlide>("welcome");
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [themeOpen, setThemeOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [frameMode, setFrameMode] = useState<"landscape" | "portrait">("landscape");

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (form && !hydratedRef.current) {
      setFormTitle(form.title);
      setFormDescription(form.description ?? "");
      hydratedRef.current = true;
    }
  }, [form]);

  const [fieldTitles, setFieldTitles] = useState<Record<string, string>>({});
  const [fieldDescriptions, setFieldDescriptions] = useState<Record<string, string>>({});
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>({});

  const hydratedFieldsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!fields) return;
    const newTitles: Record<string, string> = {};
    const newDescs: Record<string, string> = {};
    const newConfigs: Record<string, FieldConfig> = {};
    for (const f of fields) {
      if (!hydratedFieldsRef.current.has(f.id)) {
        newTitles[f.id] = f.title;
        newDescs[f.id] = f.description ?? "";
        newConfigs[f.id] = f.config as FieldConfig;
        hydratedFieldsRef.current.add(f.id);
      }
    }
    if (Object.keys(newTitles).length > 0) {
      setFieldTitles((p) => ({ ...p, ...newTitles }));
      setFieldDescriptions((p) => ({ ...p, ...newDescs }));
      setFieldConfigs((p) => ({ ...p, ...newConfigs }));
    }
  }, [fields]);

  const debouncedSaveFormTitle = useDebouncedCallback((v: string) => {
    if (!form) return;
    void updateFormAsync({ formId: form.id, title: v || "Untitled form" });
  });
  const debouncedSaveFormDesc = useDebouncedCallback((v: string) => {
    if (!form) return;
    void updateFormAsync({ formId: form.id, description: v || null });
  });
  const debouncedSaveFieldTitle = useDebouncedCallback((fieldId: string, v: string) => {
    setFieldTitles((p) => ({ ...p, [fieldId]: v }));
    void updateFieldAsync({ fieldId, title: v || "Untitled question" });
  });
  const debouncedSaveFieldDesc = useDebouncedCallback((fieldId: string, v: string) => {
    setFieldDescriptions((p) => ({ ...p, [fieldId]: v }));
    void updateFieldAsync({ fieldId, description: v || null });
  });
  const debouncedSaveFieldConfig = useDebouncedCallback((fieldId: string, config: FieldConfig) => {
    void updateFieldAsync({
      fieldId,
      config: config as Parameters<typeof updateFieldAsync>[0]["config"],
    });
  });

  const handleAddField = async (type: FieldType) => {
    if (!formId) return;
    try {
      const { id } = await createFieldAsync({ formId, type });
      hydratedFieldsRef.current.add(id);
      setActiveSlide(id);
    } catch {
      // field creation failed — UI stays on current slide
    }
  };

  const handleDeleteField = useCallback(
    async (fieldId: string) => {
      await deleteFieldAsync({ fieldId });
      hydratedFieldsRef.current.delete(fieldId);
      setFieldTitles((p) => {
        const n = { ...p };
        delete n[fieldId];
        return n;
      });
      setFieldDescriptions((p) => {
        const n = { ...p };
        delete n[fieldId];
        return n;
      });
      setFieldConfigs((p) => {
        const n = { ...p };
        delete n[fieldId];
        return n;
      });
      setActiveSlide(welcomeEnabled ? "welcome" : "endings");
    },
    [deleteFieldAsync, welcomeEnabled],
  );

  const handleTypeChange = useCallback(
    (fieldId: string, newType: FieldType) => {
      const newConfig = defaultConfigForType(newType);
      setFieldConfigs((p) => ({ ...p, [fieldId]: newConfig }));
      void updateFieldAsync({
        fieldId,
        type: newType,
        config: newConfig as Parameters<typeof updateFieldAsync>[0]["config"],
      });
    },
    [updateFieldAsync],
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !fields) return;
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const moved = arrayMove(fields, oldIndex, newIndex);
      const before = moved[newIndex - 1];
      const after = moved[newIndex + 1];
      let newOrder: number;
      if (!before) newOrder = parseFloat(after!.order) - 1;
      else if (!after) newOrder = parseFloat(before.order) + 1;
      else newOrder = (parseFloat(before.order) + parseFloat(after.order)) / 2;
      void updateFieldAsync({ fieldId: String(active.id), order: newOrder.toFixed(2) });
    },
    [fields, updateFieldAsync],
  );

  const allSlides: ActiveSlide[] = [
    ...(welcomeEnabled ? (["welcome"] as ActiveSlide[]) : []),
    ...(fields ?? []).map((f) => f.id),
    "endings",
  ];
  const currentIndex = allSlides.indexOf(activeSlide);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < allSlides.length - 1;

  const themeConfig = useMemo(
    () => (form?.themeConfig ?? { presetId: "default" }) as ThemeConfig,
    [form?.themeConfig],
  );
  const resolvedTheme = useMemo(() => resolveTheme(themeConfig), [themeConfig]);
  const canvasTheme = {
    fg: resolvedTheme.colors.foreground,
    primary: resolvedTheme.colors.primary,
    border: resolvedTheme.colors.border,
    radius:
      resolvedTheme.shape.radius === "none"
        ? "0px"
        : resolvedTheme.shape.radius === "sm"
          ? "4px"
          : resolvedTheme.shape.radius === "md"
            ? "8px"
            : resolvedTheme.shape.radius === "lg"
              ? "16px"
              : "9999px",
    fontFamily: `var(--font-${resolvedTheme.typography.fontKey.replace(/([A-Z])/g, "-$1").toLowerCase()})`,
    headingWeight:
      resolvedTheme.typography.headingWeight === "normal"
        ? "400"
        : resolvedTheme.typography.headingWeight === "medium"
          ? "500"
          : resolvedTheme.typography.headingWeight === "semibold"
            ? "600"
            : "700",
  };

  const bgStyle: React.CSSProperties =
    resolvedTheme.background.type === "solid"
      ? { background: resolvedTheme.background.value }
      : resolvedTheme.background.type === "gradient"
        ? { background: resolvedTheme.background.value }
        : {
            backgroundImage: `url(${resolvedTheme.background.value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };

  const activeField =
    typeof activeSlide === "string" && activeSlide !== "welcome" && activeSlide !== "endings"
      ? (fields?.find((f) => f.id === activeSlide) ?? null)
      : null;

  const previewForm = useMemo(() => {
    if (!form) return null;
    return {
      id: form.id,
      slug: form.slug,
      title: formTitle || form.title,
      description: formDescription || form.description,
      themeConfig: form.themeConfig,
      fields: (fields ?? []).map((f) => ({
        id: f.id,
        title: fieldTitles[f.id] ?? f.title,
        type: f.type,
        description: fieldDescriptions[f.id] ?? f.description,
        placeholder: f.placeholder,
        isRequired: f.isRequired,
        order: f.order,
        config: (fieldConfigs[f.id] ?? f.config) as { type: string } & Record<string, unknown>,
      })),
    };
  }, [form, fields, formTitle, formDescription, fieldTitles, fieldDescriptions, fieldConfigs]);

  return (
    <div className="grid grid-cols-[240px_1fr_280px] h-full">
      <aside className="border-r flex flex-col overflow-hidden bg-background">
        <div className="px-3 py-3 border-b">
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Questions
          </span>
        </div>

        <div className="flex-1 overflow-auto py-2">
          {/* Welcome screen with toggle */}
          <div
            className={cn(
              "flex items-center justify-between px-3 py-2 transition-colors",
              activeSlide === "welcome" && welcomeEnabled
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              !welcomeEnabled && "opacity-50",
            )}
          >
            <button
              className="flex-1 min-w-0 text-left flex flex-col gap-0.5"
              onClick={() => {
                if (welcomeEnabled) setActiveSlide("welcome");
              }}
              disabled={!welcomeEnabled}
            >
              <span className="text-sm font-medium truncate">Welcome</span>
              <span className="text-xs opacity-60 truncate">{formTitle || "Form title"}</span>
            </button>
            <Switch
              checked={welcomeEnabled}
              onCheckedChange={(checked) => {
                setWelcomeEnabled(checked);
                if (!checked && activeSlide === "welcome") {
                  setActiveSlide((fields ?? [])[0]?.id ?? "endings");
                }
              }}
              className="shrink-0 scale-75"
            />
          </div>

          {fieldsLoading ? (
            <div className="px-3 flex flex-col gap-1 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(fields ?? []).map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {(fields ?? []).map((f, i) => (
                    <SortableSlideItem
                      key={f.id}
                      id={f.id}
                      index={i + 1}
                      label={fieldTitles[f.id] ?? f.title}
                      type={f.type}
                      active={activeSlide === f.id}
                      onClick={() => setActiveSlide(f.id)}
                      onDelete={() => handleDeleteField(f.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add Field button after last field */}
              <AddFieldMenu onAdd={handleAddField} disabled={!formId} />
            </>
          )}

          <div className="mt-2 border-t pt-2">
            <SlideItem
              label="Endings"
              sublabel="Thank you screen"
              active={activeSlide === "endings"}
              onClick={() => setActiveSlide("endings")}
            />
          </div>
        </div>
      </aside>

      <main className="flex flex-col overflow-hidden">
        <div className="border-b px-4 py-2 flex items-center justify-center gap-3 shrink-0 bg-background">
          <Button variant="outline" size="sm" onClick={() => setThemeOpen(true)} disabled={!form}>
            <Palette />
            Theme
          </Button>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-0.5 border rounded-md p-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "size-7",
                  frameMode === "landscape" && "bg-accent text-accent-foreground",
                )}
                onClick={() => setFrameMode("landscape")}
                aria-label="Landscape"
              >
                <Monitor className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "size-7",
                  frameMode === "portrait" && "bg-accent text-accent-foreground",
                )}
                onClick={() => setFrameMode("portrait")}
                aria-label="Portrait"
              >
                <Smartphone className="size-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              disabled={!form}
            >
              Preview
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-muted/30 flex items-start justify-center p-4">
          <div
            className="relative rounded-xl overflow-hidden shadow-xl shrink-0"
            style={{
              ...(frameMode === "landscape"
                ? { width: "min(100%, 800px)", aspectRatio: "16/9" }
                : { height: "min(calc(100vh - 200px), 640px)", aspectRatio: "9/16" }),
              ...bgStyle,
            }}
          >
            {resolvedTheme.background.type === "image" && (
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{ background: `rgba(0,0,0,${resolvedTheme.background.overlay ?? 0.4})` }}
              />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-10 py-8 overflow-auto">
              {formLoading || fieldsLoading ? (
                <div className="w-full max-w-xl flex flex-col gap-4">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : activeSlide === "welcome" ? (
                <CanvasWelcome
                  title={formTitle}
                  description={formDescription}
                  onTitleChange={(v) => {
                    setFormTitle(v);
                    debouncedSaveFormTitle(v);
                  }}
                  onDescriptionChange={(v) => {
                    setFormDescription(v);
                    debouncedSaveFormDesc(v);
                  }}
                  theme={canvasTheme}
                />
              ) : activeSlide === "endings" ? (
                <CanvasEndings theme={canvasTheme} />
              ) : activeField ? (
                <CanvasField
                  field={{
                    id: activeField.id,
                    title: fieldTitles[activeField.id] ?? activeField.title,
                    description: fieldDescriptions[activeField.id] ?? activeField.description,
                    placeholder: activeField.placeholder,
                    type: activeField.type,
                    isRequired: activeField.isRequired,
                    config: fieldConfigs[activeField.id] ?? (activeField.config as FieldConfig),
                  }}
                  onTitleChange={(v) => {
                    debouncedSaveFieldTitle(activeField.id, v);
                  }}
                  onDescriptionChange={(v) => {
                    debouncedSaveFieldDesc(activeField.id, v);
                  }}
                  onConfigChange={(config) => {
                    setFieldConfigs((p) => ({ ...p, [activeField.id]: config }));
                    debouncedSaveFieldConfig(activeField.id, config);
                  }}
                  theme={canvasTheme}
                />
              ) : null}
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
              <Button
                variant="outline"
                size="icon"
                disabled={!canGoBack}
                onClick={() => setActiveSlide(allSlides[currentIndex - 1]!)}
                className="size-8 bg-background/80 backdrop-blur-sm"
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!canGoForward}
                onClick={() => setActiveSlide(allSlides[currentIndex + 1]!)}
                className="size-8 bg-background/80 backdrop-blur-sm"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <aside className="border-l overflow-auto bg-background">
        {activeField ? (
          <FieldSidebar
            field={{
              id: activeField.id,
              type: activeField.type,
              isRequired: activeField.isRequired,
              config: fieldConfigs[activeField.id] ?? (activeField.config as FieldConfig),
            }}
            onTypeChange={(newType) => handleTypeChange(activeField.id, newType)}
            onRequiredChange={(required) =>
              void updateFieldAsync({ fieldId: activeField.id, isRequired: required })
            }
            onConfigChange={(config) => {
              setFieldConfigs((p) => ({ ...p, [activeField.id]: config }));
              debouncedSaveFieldConfig(activeField.id, config);
            }}
          />
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            {activeSlide === "welcome"
              ? "Select a question to edit its settings."
              : "This is the endings screen. No settings to configure."}
          </div>
        )}
      </aside>

      <ThemeModal
        open={themeOpen}
        onOpenChange={setThemeOpen}
        config={themeConfig}
        onChange={(next) => {
          if (!form) return;
          void updateFormAsync({ formId: form.id, themeConfig: next });
        }}
      />
      <PreviewModal open={previewOpen} onOpenChange={setPreviewOpen} form={previewForm} />
    </div>
  );
}

function SlideItem({
  label,
  sublabel,
  active,
  onClick,
}: {
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="text-sm font-medium truncate">{label}</span>
      {sublabel && <span className="text-xs opacity-60 truncate">{sublabel}</span>}
    </button>
  );
}

function SortableSlideItem({
  id,
  index,
  label,
  type,
  active,
  onClick,
  onDelete,
}: {
  id: string;
  index: number;
  label: string;
  type: string;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 transition-colors",
        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-0.5 shrink-0"
      >
        <GripVertical className="size-3.5" />
      </button>
      <button onClick={onClick} className="flex-1 min-w-0 flex items-center gap-2 text-left">
        <span className="text-xs text-muted-foreground w-4 shrink-0">{index}</span>
        <span className="text-sm truncate flex-1">{label}</span>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {TYPE_LABELS[type as FieldType]}
        </Badge>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 shrink-0 size-6"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onDelete()}
          >
            <Trash2 className="size-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AddFieldMenu({ onAdd, disabled }: { onAdd: (t: FieldType) => void; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="w-full justify-start px-3 mt-1 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5 mr-1.5" />
          Add Field
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {FIELD_TYPES.map((t) => (
          <DropdownMenuItem key={t} onSelect={() => onAdd(t)}>
            {TYPE_LABELS[t]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
