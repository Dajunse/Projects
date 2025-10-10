import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { mockSections } from '../data/mockLinks';

export interface Bookmark {
  id: number;
  label: string;
  url: string;
  section: string;
  description?: string;
  tags?: string[];
}

export interface BookmarkSectionDto {
  id: string;
  title: string;
  links: Bookmark[];
}

const fetchBookmarks = async (): Promise<BookmarkSectionDto[]> => {
  try {
    const result = await invoke<BookmarkSectionDto[]>('get_bookmark_sections');
    if (!Array.isArray(result)) {
      throw new Error('Invalid response');
    }
    return result;
  } catch (error) {
    console.warn('Falling back to mock bookmark data', error);
    return mockSections.map((section) => ({
      id: section.id,
      title: section.title,
      links: section.links.map((link, index) => ({
        id: index,
        label: link.label,
        url: link.url,
        section: section.id,
        description: link.description,
        tags: link.tags,
      })),
    }));
  }
};

export const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarks,
  });
};
