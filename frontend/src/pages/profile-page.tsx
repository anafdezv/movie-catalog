import { useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { deleteComment, updateComment } from "@/api/comments";
import { getMyActivity, updateMyProfile } from "@/api/users";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/movie-presentation";
import type { UserActivity } from "@/types/user";

export function ProfilePage() {
  const { token, updateUser, user } = useAuth();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(user?.displayName ?? "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatarUrl ?? "");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "ratings" | "preferences">("notes");

  const loadActivity = async () => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const response = await getMyActivity(token);
      setActivity(response);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not load your activity."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity().catch(() => undefined);
  }, [token]);

  const handleProfileSubmit = async () => {
    if (!token) {
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedUser = await updateMyProfile(token, {
        displayName: profileName,
        avatarUrl: profileAvatar.trim() ? profileAvatar.trim() : null
      });
      updateUser(updatedUser);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not save the profile."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) {
      return;
    }

    setPendingCommentId(commentId);

    try {
      await deleteComment(token, commentId);
      await loadActivity();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not delete the note."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const handleSaveComment = async (commentId: number) => {
    if (!token) {
      return;
    }

    setPendingCommentId(commentId);

    try {
      await updateComment(token, commentId, editingContent);
      setEditingCommentId(null);
      setEditingContent("");
      await loadActivity();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not update the note."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const averageRating =
    activity?.ratings.length
      ? activity.ratings.reduce((total, rating) => total + rating.value, 0) / activity.ratings.length
      : 0;

  const stats = [
    { label: "Films rated", value: activity?.ratings.length ?? 0 },
    { label: "Notes posted", value: activity?.comments.length ?? 0 },
    { label: "Avg rating given", value: averageRating ? averageRating.toFixed(1) : "—" },
    { label: "Total activity", value: (activity?.ratings.length ?? 0) + (activity?.comments.length ?? 0) }
  ];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 xl:grid-cols-[1fr_260px] xl:items-start">
        <div className="space-y-4">
          <p className="altitude-eyebrow">Passenger dossier</p>
          <div>
            <h1 className="font-display text-6xl tracking-[-0.06em] text-[#f6efe3]">
              Good evening, {user?.displayName.split(" ")[0] ?? "Passenger"}.
            </h1>
            <p className="mt-3 text-2xl text-[#bcb6ac]">
              {activity?.comments.length ?? 0} notes · {activity?.ratings.length ?? 0} films rated
            </p>
          </div>
        </div>

        <div className="altitude-panel flex items-center gap-4 px-5 py-5">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#ff9d42] text-2xl font-semibold text-[#08111b]">
            {user ? getInitials(user.displayName) : "MC"}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold text-[#f6efe3]">{user?.displayName}</p>
            <p className="text-[0.78rem] uppercase tracking-[0.28em] text-[#8f8a83]">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="altitude-panel px-5 py-5">
            <p className="altitude-kicker">{stat.label}</p>
            <p className="mt-4 font-display text-5xl text-[#f5a141]">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="flex gap-8 border-b border-white/6">
        {[
          { id: "notes", label: "My Notes" },
          { id: "ratings", label: "My Ratings" },
          { id: "preferences", label: "Preferences" }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`border-b-2 pb-5 text-2xl font-medium ${
              activeTab === tab.id
                ? "border-[#ff9d42] text-[#f6efe3]"
                : "border-transparent text-[#9c968e]"
            }`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {activeTab === "notes" ? (
        <section className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : error && !activity ? (
            <FeedbackState
              title="Could not load your activity"
              description={error}
              action={
                <Button onClick={() => loadActivity().catch(() => undefined)} variant="outline">
                  Retry
                </Button>
              }
            />
          ) : activity?.comments.length ? (
            activity.comments.map((comment) => {
              const rating = activity.ratings.find((item) => item.movie.id === comment.movie.id);

              return (
                <Card key={comment.id} className="border-white/6 bg-[#0d1722]/95 py-0">
                  <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#152231]">
                        <span className="font-display text-4xl text-[#f5a141]">{comment.movie.title[0]}</span>
                      </div>
                      <div className="min-w-0 space-y-2">
                        <p className="font-display text-4xl text-[#f6efe3]">{comment.movie.title}</p>
                        <p className="text-sm font-semibold text-[#f5a141]">
                          {rating ? `★`.repeat(rating.value).padEnd(5, "☆") : "No rating"}{" "}
                          <span className="ml-2 text-[0.78rem] uppercase tracking-[0.28em] text-[#8f8a83]">
                            {new Date(comment.createdAt).toLocaleDateString("en-US")}
                          </span>
                        </p>
                        <p className="max-w-3xl text-lg leading-8 text-[#d3ccc2]">{comment.content}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 self-start lg:flex-col">
                      <Button
                        disabled={pendingCommentId === comment.id}
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingContent(comment.content);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        className="text-red-400"
                        disabled={pendingCommentId === comment.id}
                        onClick={() => handleDeleteComment(comment.id)}
                        size="sm"
                        variant="outline"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>

                  {editingCommentId === comment.id ? (
                    <CardContent className="space-y-3 border-t border-white/6 p-5">
                      <Textarea onChange={(event) => setEditingContent(event.target.value)} value={editingContent} />
                      <div className="flex gap-2">
                        <Button disabled={pendingCommentId === comment.id} onClick={() => handleSaveComment(comment.id)} size="sm">
                          {pendingCommentId === comment.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          disabled={pendingCommentId === comment.id}
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  ) : null}
                </Card>
              );
            })
          ) : (
            <FeedbackState title="No notes yet" description="You have not posted any notes yet." />
          )}
        </section>
      ) : null}

      {activeTab === "ratings" ? (
        <section className="altitude-panel overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/6 px-6 py-5 text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
            <span>Film</span>
            <span>Rated</span>
            <span className="text-right">Your rating</span>
          </div>
          {activity?.ratings.length ? (
            activity.ratings.map((rating) => (
              <div
                key={rating.id}
                className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/6 px-6 py-5 last:border-b-0"
              >
                <span className="font-display text-4xl text-[#f6efe3]">{rating.movie.title}</span>
                <span className="text-[0.78rem] uppercase tracking-[0.28em] text-[#8f8a83]">
                  {new Date(rating.updatedAt).toLocaleDateString("en-US")}
                </span>
                <span className="text-right text-lg font-semibold text-[#f5a141]">
                  {"★".repeat(rating.value).padEnd(5, "☆")}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6">
              <FeedbackState title="No ratings yet" description="You have not rated any films yet." />
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "preferences" ? (
        <section className="max-w-3xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileName">Display name</Label>
            <Input id="profileName" onChange={(event) => setProfileName(event.target.value)} value={profileName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileAvatar">Avatar URL</Label>
            <Input
              id="profileAvatar"
              onChange={(event) => setProfileAvatar(event.target.value)}
              value={profileAvatar}
            />
          </div>

          <div className="altitude-panel flex items-center gap-4 px-5 py-5">
            <div className="flex size-18 items-center justify-center rounded-full bg-[#ff9d42] text-3xl font-semibold text-[#08111b]">
              {user ? getInitials(profileName || user.displayName) : "MC"}
            </div>
            <div>
              <p className="text-xl font-semibold text-[#f6efe3]">Avatar preview</p>
              <p className="text-sm text-[#8f8a83]">Used across your notes and cabin profile.</p>
            </div>
          </div>

          <Button disabled={isSavingProfile} onClick={handleProfileSubmit} size="lg">
            {isSavingProfile ? "Saving..." : "Save preferences"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}
