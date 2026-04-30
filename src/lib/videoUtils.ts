export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(regExp);
  return (match && match[3]) ? match[3] : null;
}

export function getVideoThumbnail(url: string): string {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    // Note: Vimeo thumbnail would ideally need an API call, but we can try a placeholder or use a default if not found
    // For now, let's use a generic image for Vimeo as getting it synchronously is tricky without their API
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }

  return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop";
}

export function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  }
  
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  }

  return null;
}
