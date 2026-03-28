"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/atoms/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/atoms/carousel";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    id: 1,
    name: "Eliska Trebalska",
    role: "Mother",
    content:
      "“With Realtioo we have been able move to another country in a 4 weeks. Incredible!”",
    date: "8:35 PM - Jan 4, 2022",
    rating: 5,
    avatar: "/testimonial-placeholder.png",
  },
  {
    id: 2,
    name: "Jurek Jalio",
    role: "Father",
    content:
      "“First touch with Realtioo was amazing. We found our dream home in record time.”",
    date: "8:35 PM - Jan 6, 2022",
    rating: 5,
    avatar: "/testimonial-placeholder.png",
  },
  {
    id: 3,
    name: "Sarah Smith",
    role: "Designer",
    content:
      "“The platform is intuitive and easy to use. Highly recommended for families.”",
    date: "9:15 AM - Jan 10, 2022",
    rating: 5,
    avatar: "/testimonial-placeholder.png",
  },
];

const AuthPageTestimonial = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full mx-auto px-4 pb-12 mt-4">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
            stopOnMouseEnter: true,
            stopOnInteraction: false,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-8 items-center">
          {testimonials.map((testimonial, index) => (
            <CarouselItem
              key={testimonial.id}
              className="pl-4 md:pl-8 basis-full md:basis-[70%] lg:basis-[75%]"
            >
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  current === index
                    ? "opacity-100 scale-100"
                    : "opacity-60 scale-90 blur-[1px]"
                )}
              >
                <Card className="border-none shadow-none bg-white rounded-3xl overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="rounded-full object-cover bg-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 truncate">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
                      {testimonial.content}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs md:text-sm text-gray-400 font-medium">
                        {testimonial.date}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 md:w-5 md:h-5 fill-emerald-800 text-emerald-800"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300",
                current === index
                  ? "bg-white w-4 h-4"
                  : "bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default AuthPageTestimonial;
