'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold, Italic, List, ListOrdered, Link as LinkIcon,
    Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
    Undo, Redo, Heading1, Heading2, Code, Eye
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface EmailEditorProps {
    initialContent?: string;
    onChange: (html: string) => void;
}

export function EmailEditor({ initialContent = '', onChange }: EmailEditorProps) {
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [sourceContent, setSourceContent] = useState(initialContent);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-purple-600 underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: initialContent,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setSourceContent(html);
            onChange(html);
        },
    });

    // Update editor content when initialContent changes
    useEffect(() => {
        if (initialContent !== sourceContent) {
            setSourceContent(initialContent);
            if (editor && editor.getHTML() !== initialContent) {
                editor.commands.setContent(initialContent);
            }
        }
    }, [initialContent, editor]);

    const toggleSourceMode = () => {
        if (isSourceMode) {
            // Switching from Source to Visual
            // Update Tiptap with the source content
            editor?.commands.setContent(sourceContent);
        } else {
            // Switching from Visual to Source
            // Ensure source content is up to date (already handled by onUpdate, but good to be safe)
            setSourceContent(editor?.getHTML() || '');
        }
        setIsSourceMode(!isSourceMode);
    };

    const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setSourceContent(newContent);
        onChange(newContent);
    };

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL:', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('Kép URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
                <ToolbarButton
                    onClick={toggleSourceMode}
                    isActive={isSourceMode}
                    icon={isSourceMode ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                    title={isSourceMode ? "Előnézet" : "Forráskód"}
                />

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                {!isSourceMode && (
                    <>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            icon={<Bold className="w-4 h-4" />}
                            title="Félkövér"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            icon={<Italic className="w-4 h-4" />}
                            title="Dőlt"
                        />
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            isActive={editor.isActive('heading', { level: 1 })}
                            icon={<Heading1 className="w-4 h-4" />}
                            title="Címsor 1"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor.isActive('heading', { level: 2 })}
                            icon={<Heading2 className="w-4 h-4" />}
                            title="Címsor 2"
                        />

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            isActive={editor.isActive({ textAlign: 'left' })}
                            icon={<AlignLeft className="w-4 h-4" />}
                            title="Balra igazítás"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            isActive={editor.isActive({ textAlign: 'center' })}
                            icon={<AlignCenter className="w-4 h-4" />}
                            title="Középre igazítás"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            isActive={editor.isActive({ textAlign: 'right' })}
                            icon={<AlignRight className="w-4 h-4" />}
                            title="Jobbra igazítás"
                        />

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            icon={<List className="w-4 h-4" />}
                            title="Felsorolás"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            icon={<ListOrdered className="w-4 h-4" />}
                            title="Számozott lista"
                        />

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                        <ToolbarButton
                            onClick={setLink}
                            isActive={editor.isActive('link')}
                            icon={<LinkIcon className="w-4 h-4" />}
                            title="Link"
                        />
                        <ToolbarButton
                            onClick={addImage}
                            isActive={false}
                            icon={<ImageIcon className="w-4 h-4" />}
                            title="Kép"
                        />

                        <div className="flex-grow" />

                        <ToolbarButton
                            onClick={() => editor.chain().focus().undo().run()}
                            isActive={false}
                            icon={<Undo className="w-4 h-4" />}
                            title="Visszavonás"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().redo().run()}
                            isActive={false}
                            icon={<Redo className="w-4 h-4" />}
                            title="Mégis"
                        />
                    </>
                )}
            </div>

            <div className="min-h-[300px] relative">
                {isSourceMode ? (
                    <textarea
                        value={sourceContent}
                        onChange={handleSourceChange}
                        className="w-full h-full min-h-[300px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none resize-y"
                        placeholder="Írd vagy másold ide a HTML kódot..."
                    />
                ) : (
                    <EditorContent editor={editor} />
                )}
            </div>
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive: boolean;
    icon: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, icon, title }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
        ${isActive ? 'bg-gray-200 dark:bg-gray-700 text-purple-600' : 'text-gray-600 dark:text-gray-300'}
      `}
            type="button"
        >
            {icon}
        </button>
    );
}
