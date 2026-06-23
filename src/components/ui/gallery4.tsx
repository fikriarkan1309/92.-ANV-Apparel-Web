/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "./button";
import { GlowCard } from "./spotlight-card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./carousel";

export interface Gallery4Item {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface Gallery4Props {
  title?: string;
  description?: string;
  items: Gallery4Item[];
  onItemClick?: (item: Gallery4Item) => void;
}

const defaultData = [
  {
    id: "jersey-bola",
    title: "Jersey Bola Premium",
    description: "Desain jersey sepakbola & futsal sublimasi dengan bahan breathable dry-fit berpori serat tinggi.",
    href: "#",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "jersey-basket",
    title: "Jersey Basket Profesional",
    description: "Kerah v-neck rib kokoh, bahan premium berpori udara ideal untuk pergerakan fleksibel di lapangan.",
    href: "#",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "jersey-sepeda",
    title: "Jersey Sepeda / Running",
    description: "Teknologi aerodinamis modern dengan kantong belakang opsional dan zip saku reflektif aman.",
    href: "#",
    image: "https://images.unsplash.com/photo-1592656094267-764a45159073?q=80&w=600&auto=format&fit=crop",
  },
];

const Gallery4 = ({
  title = "Spesialisasi Produk",
  description = "Temukan berbagai jenis pakaian olahraga sublimasi kelas pro yang kami kerjakan dengan ketelitian tingkat tinggi.",
  items = defaultData,
  onItemClick,
}: Gallery4Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  return (
    <section className="py-20 bg-neutral-950 text-white border-t border-neutral-900">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex items-end justify-between md:mb-14 lg:mb-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black text-white md:text-4xl lg:text-5xl uppercase tracking-tight">
              {title}
            </h2>
            <p className="max-w-lg text-neutral-400 font-medium">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:opacity-40 disabled:cursor-not-allowed border-neutral-800 bg-neutral-900 rounded-full text-white"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:opacity-40 disabled:cursor-not-allowed border-neutral-800 bg-neutral-900 rounded-full text-white"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-0 2xl:ml-[max(8rem,calc(50vw-700px))] 2xl:mr-[max(0rem,calc(50vw-700px))]">
             {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[320px] pl-[20px] lg:max-w-[360px]"
              >
                <GlowCard 
                  glowColor="orange" 
                  customSize 
                  className="p-0 border-0 overflow-hidden group bg-transparent rounded-xl cursor-pointer"
                  onClick={() => onItemClick?.(item)}
                >
                  <div className="relative h-full min-h-[22rem] max-w-full overflow-hidden rounded-xl aspect-[3/4] md:aspect-[5/4] lg:aspect-[16/9]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 h-full bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white md:p-8">
                      <div className="mb-2 pt-4 text-xl font-extrabold md:mb-3 md:pt-4 lg:pt-4 uppercase">
                        {item.title}
                      </div>
                      <div className="mb-4 line-clamp-2 text-neutral-300 text-xs md:text-sm">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-orange-500" : "bg-neutral-800"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { Gallery4 };
