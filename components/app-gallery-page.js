"use client"

import { useState } from 'react'
import { Heart, MoreHorizontal } from 'lucide-react'

const images = [
  { id: 1, src: "/placeholder.svg?height=400&width=300", alt: "Horse in a field" },
  { id: 2, src: "/placeholder.svg?height=600&width=400", alt: "Cat with yellow eyes" },
  { id: 3, src: "/placeholder.svg?height=300&width=400", alt: "Sunset on a beach" },
  { id: 4, src: "/placeholder.svg?height=400&width=300", alt: "Tabby cat" },
  { id: 5, src: "/placeholder.svg?height=300&width=400", alt: "Dog on pebbles" },
  { id: 6, src: "/placeholder.svg?height=400&width=300", alt: "Fluffy dog on grass" },
  { id: 7, src: "/placeholder.svg?height=300&width=400", alt: "Roasted chicken" },
  { id: 8, src: "/placeholder.svg?height=400&width=300", alt: "White sneakers" },
]

export function PageJs() {
  const [favorites, setFavorites] = useState(new Set())

  const toggleFavorite = (id) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  return (
    (<div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-6">Favorite Images</h1>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover rounded-lg" />
            <button
              onClick={() => toggleFavorite(image.id)}
              className="absolute top-2 left-2 p-2 rounded-full bg-base-100 bg-opacity-50 hover:bg-opacity-75 transition-opacity">
              <Heart
                className={`w-6 h-6 ${
                  favorites.has(image.id) ? 'text-red-500 fill-current' : 'text-white'
                }`} />
            </button>
            <div
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-circle btn-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a>Add to Album</a></li>
                  <li><a>Edit</a></li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>)
  );
}