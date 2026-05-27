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
import { GripVertical } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { TYPE_LABELS, type FieldType } from "~/lib/field-types";
import { cn } from "~/lib/utils";

type SortableField = {
  id: string;
  title: string;
  type: string;
  order: string;
};

export function SortableFieldList({
  fields,
  selectedFieldId,
  onSelect,
  onReorder,
}: {
  fields: SortableField[];
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onReorder: (fieldId: string, newOrder: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(fields, oldIndex, newIndex);
    const before = moved[newIndex - 1];
    const after = moved[newIndex + 1];

    let newOrder: number;
    if (!before) {
      newOrder = parseFloat(after!.order) - 1;
    } else if (!after) {
      newOrder = parseFloat(before.order) + 1;
    } else {
      newOrder = (parseFloat(before.order) + parseFloat(after.order)) / 2;
    }

    onReorder(String(active.id), newOrder.toFixed(2));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {fields.map((f, i) => (
            <SortableRow
              key={f.id}
              field={f}
              index={i}
              selected={f.id === selectedFieldId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  field,
  index,
  selected,
  onSelect,
}: {
  field: SortableField;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
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
        "group flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
        selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <button
        onClick={() => onSelect(field.id)}
        className="flex-1 min-w-0 flex items-center gap-2 text-left text-sm"
      >
        <span className="text-xs text-muted-foreground w-5 shrink-0">{index + 1}</span>
        <span className="truncate flex-1">{field.title}</span>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {TYPE_LABELS[field.type as FieldType]}
        </Badge>
      </button>
    </div>
  );
}
