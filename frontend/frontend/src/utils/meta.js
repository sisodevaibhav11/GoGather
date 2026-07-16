export function setMetaTag(attribute, key, content) {
  let tag = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}
