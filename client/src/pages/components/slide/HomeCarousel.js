import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import './HomeCarousel.css';
import slideService from "./../../../api/slideService";
import SlideSkeleton from './../loading/SlideSkeleton';

const HomeCarousel = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await slideService.getListsGuest({
                    page_site: "home"
                });
                setSlides(response.data.data);
            } catch (error) {
                console.error("Error fetching slides:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, []);

    // Default slides nếu không có data từ API
    const defaultSlides = [
        {
            id: 1,
            avatar: "/images/bg-login.jpg",
            name: "HomeLife Store - Đồ gia dụng chất lượng"
        },
        {
            id: 2,
            avatar: "/images/default-category.png",
            name: "Sản phẩm đa dạng"
        },
        {
            id: 3,
            avatar: "/images/default.png",
            name: "Giá cả hợp lý"
        }
    ];

    const slidesToShow = slides && slides.length > 0 ? slides : defaultSlides;

    return (
        <div className="fullscreen-carousel">
            {loading ? (
                <SlideSkeleton />
            ) : (
                <Carousel 
                    className="simple-carousel" 
                    indicators={true} 
                    controls={true} 
                    interval={3000}
                    fade={true}
                >
                    {slidesToShow.map((slide, idx) => (
                        <Carousel.Item key={slide.id || idx}>
                            <div className="slide-image-container">
                                <img
                                    src={slide.avatar || "/images/default.png"}
                                    alt={slide.name || `Slide ${idx + 1}`}
                                    className="slide-image"
                                />
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}
        </div>
    );
};

export default HomeCarousel;
