import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";

interface ChatLinkProps {
  to: string;
  icon?: any;
  label?: string;
  id?: number;
  handleDropdownToggle: (id: number) => void;
  selectedChatId: number | null;
}

const ChatLink: React.FC<ChatLinkProps> = ({ to, icon, label, id, handleDropdownToggle, selectedChatId }) => {
  const handleMouseEnter = () => {
    if (id) {
      handleDropdownToggle(id);
    }
  };

  const handleMouseLeave = () => {
    if (id) {
      handleDropdownToggle(id);
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={to}
        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200"
      >
        {icon && <FontAwesomeIcon icon={icon} className="w-5 h-5" />}
        <span className="flex-grow">{label}</span>
        {id && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDropdownToggle(id);
            }}
            className="relative transition-opacity duration-200 hover:bg-gray-200 rounded"
          >
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
            />
          </button>
        )}
      </Link>
    </div>
  );
};

export default ChatLink;
