"use client";

import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import Link from "next/link";

// Mock data for existing boards
const initialBoards = [
  {
    id: 1,
    title: "Travel Goals",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 2,
    title: "Career Aspirations",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 3,
    title: "Dream Home",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
];

export default function Boards() {
  const [boards, setBoards] = useState(initialBoards);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      const newBoard = {
        id: boards.length + 1,
        title: newBoardTitle.trim(),
        imageUrl: "/placeholder.svg?height=300&width=400",
      };
      setBoards([...boards, newBoard]);
      setNewBoardTitle("");
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Vision Boards</h1>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
          <Plus className="w-5 h-5 mr-2" /> Create New Board
        </button>
      </div>

      {isCreating && (
        <div className="mb-6">
          <form onSubmit={handleCreateBoard} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter board title"
              className="input input-bordered flex-grow"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Create
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {boards.map((board) => (
          <div key={board.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={board.imageUrl}
                alt={board.title}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{board.title}</h2>
              <div className="card-actions justify-end">
                <Link
                  href={`/boards/${board.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View
                </Link>
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-sm btn-square"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <a>Edit</a>
                    </li>
                    <li>
                      <a>Delete</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
