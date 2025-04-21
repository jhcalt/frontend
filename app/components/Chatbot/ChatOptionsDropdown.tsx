import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useFetcher } from 'react-router';
import { createPortal } from 'react-dom';

interface ChatOptionsDropdownProps {
  isOpen: boolean;
  chatId: string | number;
  chatLabel?: string;
  onClose: () => void;
  className?: string;
}

// Dropdown component
const ChatOptionsDropdown: React.FC<ChatOptionsDropdownProps> = ({
    isOpen,
    chatId,
    chatLabel,
    onClose,
    className
  }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fetcher = useFetcher();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(chatLabel || '');
    const [position, setPosition] = useState({ top: 0, left: 0 });
  
    // Debug fetcher state
    useEffect(() => {
      if (fetcher.state === 'submitting') {
        console.log('Submitting:', fetcher.formData);
      }
      if (fetcher.state === 'idle' && fetcher.data) {
        console.log('Response:', fetcher.data);
        if (fetcher.data.success) {
          onClose();
        }
      }
    }, [fetcher.state, fetcher.data, onClose]);

    useEffect(() => {
      if (!isOpen) {
          setIsRenaming(false);
          setNewName(chatLabel || '');
      }
    }, [isOpen, chatLabel]);

    useEffect(() => {
      if (isOpen) {
        const button = document.querySelector(`[data-chat-id="${chatId}"]`) as HTMLElement;
        if (button) {
          const rect = button.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          
          // On mobile, position the dropdown below the button instead of to the right
          if (isMobile) {
            setPosition({
              top: rect.bottom + 8,
              left: rect.left
            });
          } else {
            setPosition({
              top: rect.top,
              left: rect.right + 8 // 8px offset from button
            });
          }
        }
      }
    }, [isOpen, chatId]);
  
    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newName !== chatLabel) {
          const formData = new FormData();
          formData.append('_action', 'rename');
          formData.append('chatId', chatId.toString());
          formData.append('chatLabel', chatLabel || '');
          formData.append('newName', newName.trim());
      
          fetcher.submit(formData, {
            method: 'POST',
            action: '/resources/sidebar-actions'
          });
          
          setIsRenaming(false);
        }
      };
      
      const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
          const formData = new FormData();
          formData.append('_action', 'delete');
          formData.append('chatId', chatId.toString());
          formData.append('chatLabel', chatLabel || '');
      
          fetcher.submit(formData, {
            method: 'POST',
            action: '/resources/sidebar-actions'
          });
        }
      };

    if (!isOpen) return null;

    const portal = createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
        className="w-20 md:w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-[9999] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          {isRenaming ? (
            <fetcher.Form
              onSubmit={handleRename}
              className="px-4 py-2"
              method="post"
              action="/resources/sidebar-actions"
            >
                <input
                  type="text"
                  name="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsRenaming(false);
                      setNewName(chatLabel || '');
                    }
                  }}
                  onBlur={() => {
                    if (!newName.trim() || newName === chatLabel) {
                      setIsRenaming(false);
                      setNewName(chatLabel || '');
                    }
                  }}
                />
                <input type="hidden" name="_action" value="rename" />
                <input type="hidden" name="chatId" value={chatId.toString()} />
                <input type="hidden" name="chatLabel" value={chatLabel || ''} />
              </fetcher.Form>
            ) : (
              <>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faPencil} className="w-4 h-4 mr-2" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
    
          {fetcher.state !== 'idle' && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>,
      document.getElementById('portal-container') || document.body
    );

    return portal;
  };

export default ChatOptionsDropdown;
