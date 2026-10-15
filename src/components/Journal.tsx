import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { JournalEntry } from '../types';

export const Journal: React.FC = () => {
  const { journalEntries, addJournal, updateJournal, deleteJournal } = useData();

  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Reflection']);
  const [moodAssociation, setMoodAssociation] = useState('Good');
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyBlur, setPrivacyBlur] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Load first entry if available
  useEffect(() => {
    if (journalEntries.length > 0 && !activeEntryId) {
      const entry = journalEntries[0];
      setActiveEntryId(entry.id);
      setTitle(entry.title);
      setContent(entry.content);
      setTags(entry.tags || []);
      setMoodAssociation(entry.moodAssociation || 'Good');
      setIsPrivate(entry.isPrivate);
      setIsEditing(false);
      setSaveStatus('saved');
    }
  }, [journalEntries, activeEntryId]);

  const loadEntry = (entry: JournalEntry) => {
    setActiveEntryId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setTags(entry.tags || []);
    setMoodAssociation(entry.moodAssociation || 'Good');
    setIsPrivate(entry.isPrivate);
    setIsEditing(false);
    setSaveStatus('saved');
  };

  const startNewEntry = () => {
    setActiveEntryId(null);
    setTitle('');
    setContent('');
    setTags(['Mindfulness']);
    setMoodAssociation('Good');
    setIsPrivate(false);
    setIsEditing(true);
    setSaveStatus('dirty');
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaveStatus('saving');

    try {
      if (activeEntryId) {
        await updateJournal(activeEntryId, {
          title: title.trim() || 'Untitled Reflection',
          content: content.trim(),
          tags,
          moodAssociation,
          isPrivate,
        });
      } else {
        const newEntry = await addJournal({
          title: title.trim() || 'Untitled Reflection',
          content: content.trim(),
          tags,
          moodAssociation,
          isPrivate,
        });
        setActiveEntryId(newEntry.id);
      }
      setSaveStatus('saved');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save journal:', err);
    }
  };

  // Filter journals
  const filteredJournals = journalEntries.filter(j => {
    const matchesSearch = searchQuery
      ? j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesTag = selectedTagFilter ? j.tags && j.tags.includes(selectedTagFilter) : true;
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(journalEntries.flatMap(j => j.tags || [])));

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Intro & Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Private Reflections</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
            Safe, distraction-free journaling.
          </h2>
          <p className="text-sm text-[#4E6B5D] mt-1">
            Express thoughts openly. Unclutter your mind and preserve your story in a sacred space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrivacyBlur(!privacyBlur)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
              privacyBlur
                ? 'bg-[#EAF2EC] text-[#2D5A46] border-[#2D5A46]'
                : 'bg-white text-[#5C7A6D] border-[#E0E8E2] hover:bg-stone-50'
            }`}
            title="Privacy blur obscures text when writing in public areas"
          >
            {privacyBlur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{privacyBlur ? 'Privacy Blur: On' : 'Privacy Blur'}</span>
          </button>

          <button
            onClick={startNewEntry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Entries List / Search (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E5EDE7] shadow-sm space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-[#F9FAF8] border border-[#E0E8E2] rounded-xl pl-9 pr-3 py-2 text-[#163327] focus:ring-1 focus:ring-[#2D5A46] focus:outline-none"
            />
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedTagFilter(null)}
                className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                  selectedTagFilter === null
                    ? 'bg-[#2D5A46] text-white font-semibold'
                    : 'bg-[#F2F6F3] text-[#4E6B5D] hover:bg-stone-200/60'
                }`}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTagFilter(selectedTagFilter === t ? null : t)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                    selectedTagFilter === t
                      ? 'bg-[#2D5A46] text-white font-semibold'
                      : 'bg-[#F2F6F3] text-[#4E6B5D] hover:bg-stone-200/60'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* List of Entries */}
          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredJournals.map((entry) => {
              const isSelected = activeEntryId === entry.id;
              return (
                <div
                  key={entry.id}
                  onClick={() => loadEntry(entry)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#EAF2EC] border-[#2D5A46]/40 shadow-xs'
                      : 'bg-[#F9FAF8] border-[#E8ECE6] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#5C7A6D] mb-1">
                    <span>{entry.date}</span>
                    <span className="tabular-nums">{entry.wordCount} words</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#163327] line-clamp-1">{entry.title}</h4>
                  <p className={`text-xs text-[#4E6B5D] line-clamp-2 leading-relaxed ${privacyBlur ? 'blur-xs select-none' : ''}`}>
                    {entry.content}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tg, i) => (
                        <span key={i} className="text-[10px] text-[#2D5A46] bg-white/70 px-1.5 py-0.5 rounded">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredJournals.length === 0 && (
              <p className="text-xs text-[#5C7A6D] text-center py-8">
                No entries match your search criteria.
              </p>
            )}
          </div>
        </div>

        {/* Editor / Reader Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-6">
          {/* Editor Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0F4F1]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#5C7A6D] uppercase">
                {activeEntryId ? 'Entry View' : 'New Draft'}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-xs text-[#5C7A6D] tabular-nums">
                {wordCount} words
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-xs font-medium text-[#2D5A46]">
                {saveStatus === 'saved' ? 'All changes saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved draft'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeEntryId && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#2D5A46] bg-[#EAF2EC] rounded-lg hover:bg-[#D8E6DC] transition-colors"
                >
                  {isEditing ? 'Preview' : 'Edit Text'}
                </button>
              )}

              {activeEntryId && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this reflection?')) {
                      deleteJournal(activeEntryId);
                      startNewEntry();
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {isEditing ? (
              <input
                type="text"
                placeholder="Give your reflection a title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaveStatus('dirty');
                }}
                className="w-full text-xl sm:text-2xl font-bold text-[#163327] placeholder:text-stone-300 border-none focus:outline-none focus:ring-0 p-0"
              />
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold text-[#163327]">
                {title || 'Untitled Reflection'}
              </h2>
            )}

            {/* Tag Inputs and Meta */}
            {isEditing && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[#5C7A6D]">Tags:</span>
                {tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => removeTag(t)}
                    className="inline-flex items-center gap-1 bg-[#EAF2EC] text-[#2D5A46] px-2 py-0.5 rounded-md cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Click to remove"
                  >
                    #{t} ×
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag + Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="border border-[#D8E4DC] rounded-md px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
                />
              </div>
            )}

            {/* Main Content Area */}
            {isEditing ? (
              <textarea
                rows={14}
                placeholder="Begin typing here... What thoughts, emotions, or bodily sensations are present right now?"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setSaveStatus('dirty');
                }}
                className={`w-full text-sm leading-relaxed text-[#163327] border border-[#E5EDE7] rounded-2xl p-4 sm:p-5 focus:outline-none focus:ring-1 focus:ring-[#2D5A46] bg-[#FDFEFC] transition-all ${
                  privacyBlur ? 'blur-xs' : ''
                }`}
              />
            ) : (
              <div
                className={`p-5 rounded-2xl bg-[#F9FAF8] border border-[#E8ECE6] text-sm leading-relaxed text-[#163327] whitespace-pre-wrap ${
                  privacyBlur ? 'blur-xs select-none' : ''
                }`}
              >
                {content}
              </div>
            )}

            {/* Action Bottom */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-all"
                >
                  Save Reflection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;