"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBook } from "@/lib/actions/library";
import type { BookCategory, BookAuthor, BookPublisher } from "@/lib/types/database.types";

interface NewBookFormProps {
  categories: BookCategory[];
  authors: BookAuthor[];
  publishers: BookPublisher[];
}

export function NewBookForm({ categories, authors, publishers }: NewBookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [publicationYear, setPublicationYear] = useState<number | "">(new Date().getFullYear());
  const [edition, setEdition] = useState("");
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [locationShelf, setLocationShelf] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Book title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createBook({
        title: title.trim(),
        isbn: isbn.trim() || undefined,
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        author_name: authorName.trim() || undefined,
        publisher_name: publisherName.trim() || undefined,
        publication_year: publicationYear ? Number(publicationYear) : undefined,
        edition: edition.trim() || undefined,
        total_copies: Number(totalCopies) || 1,
        location_shelf: locationShelf.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/library/books");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create book");
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Book Information
        </CardTitle>
        <CardDescription>
          Enter the details of the new book to add it to the library catalogue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-3 text-sm rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Introduction to Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="e.g. 978-0262033848"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition">Edition</Label>
              <Input
                id="edition"
                placeholder="e.g. 3rd Edition"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="e.g. Thomas H. Cormen"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                placeholder="e.g. MIT Press"
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pubYear">Publication Year</Label>
              <Input
                id="pubYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copies">Total Copies *</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Math.max(1, Number(e.target.value)))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shelf">Location / Shelf</Label>
              <Input
                id="shelf"
                placeholder="e.g. Shelf A3-12"
                value={locationShelf}
                onChange={(e) => setLocationShelf(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief summary or description of the book..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link href="/library/books">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="gradient-primary text-white border-0"
              id="submit-new-book-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
