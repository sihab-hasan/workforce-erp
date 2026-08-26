import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workforce-erp/ui/components/avatar";
import { Button } from "@workforce-erp/ui/components/button";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { cn } from "@workforce-erp/ui";

export type CommentItem = {
  id: string;
  author: string;
  avatarUrl?: string;
  initials?: string;
  content: React.ReactNode;
  timestamp?: React.ReactNode;
  edited?: boolean;
  actions?: React.ReactNode;
};

export type CommentsProps = React.ComponentProps<"section"> & {
  comments: CommentItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  currentUser?: { name: string; avatarUrl?: string; initials?: string };
  placeholder?: string;
  submitting?: boolean;
  readOnly?: boolean;
};

export function Comments({
  comments,
  value = "",
  onValueChange,
  onSubmit,
  currentUser,
  placeholder = "Add a comment…",
  submitting,
  readOnly,
  className,
  ...props
}: CommentsProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {!readOnly && onValueChange && onSubmit ? (
        <div className="flex gap-3 rounded-2xl border bg-card p-3">
          {currentUser ? (
            <Avatar className="mt-0.5 size-8 shrink-0">
              {currentUser.avatarUrl ? <AvatarImage src={currentUser.avatarUrl} alt="" /> : null}
              <AvatarFallback>
                {currentUser.initials ?? currentUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <Textarea
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder={placeholder}
              className="min-h-20 resize-y"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!value.trim() || submitting}
                onClick={() => onSubmit(value.trim())}
              >
                {submitting ? "Posting…" : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="space-y-1">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="flex gap-3 rounded-xl px-2 py-3 hover:bg-muted/30">
              <Avatar className="size-8 shrink-0">
                {comment.avatarUrl ? <AvatarImage src={comment.avatarUrl} alt="" /> : null}
                <AvatarFallback>
                  {comment.initials ?? comment.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold">{comment.author}</span>
                  {comment.timestamp ? (
                    <span className="text-xs text-muted-foreground">
                      {comment.timestamp}
                      {comment.edited ? " · edited" : ""}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {comment.content}
                </div>
                {comment.actions ? (
                  <div className="mt-2 flex items-center gap-2">{comment.actions}</div>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No comments yet.
          </div>
        )}
      </div>
    </section>
  );
}
