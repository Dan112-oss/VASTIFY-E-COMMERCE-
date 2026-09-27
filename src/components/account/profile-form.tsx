"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type FormState } from "@/app/account/actions";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function ProfileForm({
  userId,
  initialName,
  initialPhone,
  initialAvatarUrl,
}: {
  userId: string;
  initialName: string;
  initialPhone: string;
  initialAvatarUrl: string | null;
}) {
  const [state, formAction, pending] = React.useActionState<
    FormState,
    FormData
  >(updateProfile, null);

  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (state?.error === undefined && state !== null) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please use a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("Photo must be under 4 MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    const supabase = createClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      setUploadError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new photo shows immediately
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-border bg-card p-5"
    >
      <input type="hidden" name="avatar_url" value={avatarUrl} />

      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile photo"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <User className="size-8" />
            </div>
          )}
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Change photo"
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={handleAvatar}
              className="sr-only"
            />
          </label>
          {uploadError && (
            <p className="mt-1.5 text-xs text-destructive">{uploadError}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          maxLength={80}
          defaultValue={initialName}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={30}
          defaultValue={initialPhone}
          placeholder="+1 555 123 4567"
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      {saved && (
        <p
          role="status"
          className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
