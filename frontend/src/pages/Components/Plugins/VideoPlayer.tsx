import React from "react";
import BreadCrumb from "Common/BreadCrumb";

const videoId = "qYgogv4R8zg";
const provider = "youtube";

const VideoPlayer = () => {
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    const plyrVideo =
        videoId && provider ? (
            <iframe
                src={embedUrl}
                width="100%"
                height="315"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
            />
        ) : null;

    return (
        <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
            <BreadCrumb title="Video Player" pageTitle="Plugins" />

            <div>
                <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-2">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="mb-4 text-gray-800 text-15 dark:text-white">Preview Video Player</h6>
                            {plyrVideo}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

