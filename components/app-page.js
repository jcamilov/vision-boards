'use client'

import Link from 'next/link'
import { Camera, Layers, Heart } from 'lucide-react'

export function PageJs() {
  return (
    (<div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Vision Boards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Camera className="w-12 h-12 text-primary" />}
          title="Manage Your Gallery"
          description="Organize and view your images in a beautiful, responsive gallery. Create albums to keep your photos organized."
          link="/gallery" />
        <FeatureCard
          icon={<Layers className="w-12 h-12 text-primary" />}
          title="Create Vision Boards"
          description="Design inspiring vision boards by combining your favorite images. Visualize your goals and dreams."
          link="/boards" />
        <FeatureCard
          icon={<Heart className="w-12 h-12 text-primary" />}
          title="Favorite Images"
          description="Mark your most loved images as favorites for quick access and use in your vision boards."
          link="/gallery" />
      </div>
      <div className="mt-12 text-center">
        <Link href="/gallery" className="btn btn-primary btn-lg">
          Get Started
        </Link>
      </div>
    </div>)
  );
}

function FeatureCard({ icon, title, description, link }) {
  return (
    (<div className="card bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        {icon}
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="card-actions">
          <Link href={link} className="btn btn-primary">
            Explore
          </Link>
        </div>
      </div>
    </div>)
  );
}