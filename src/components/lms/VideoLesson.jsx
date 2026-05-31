export default function VideoLesson({ lesson, locale }) {
  const url = lesson.content?.video?.url || '';
  const isYoutube = url.includes('youtube') || url.includes('youtu.be');
  const embedUrl = isYoutube
    ? url.includes('embed') ? url : url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
    : url;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        {embedUrl ? (
          <iframe src={embedUrl} title={lesson.title?.ar} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">لا يوجد فيديو</div>
        )}
      </div>
      {lesson.description?.[locale] && (
        <p className="mt-4 text-gray-300 leading-relaxed">{lesson.description[locale]}</p>
      )}
    </div>
  );
}
