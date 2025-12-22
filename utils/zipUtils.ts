import JSZip from 'jszip';
import { SkillPackage } from '../types';

export const createSkillZip = async (skill: SkillPackage): Promise<Blob> => {
  const zip = new JSZip();

  // Create the root folder matches the slug (best practice)
  const root = zip.folder(skill.slug);
  if (!root) throw new Error("Failed to create zip folder");

  // 1. Create SKILL.md
  const skillMdContent = `---
name: ${skill.frontmatter.name}
description: ${skill.frontmatter.description}
---

${skill.body}`;
  
  root.file("SKILL.md", skillMdContent);

  // 2. Add Resources
  skill.resources.forEach(file => {
    if (file.type === 'script') {
      root.file(`scripts/${file.filename}`, file.content);
    } else if (file.type === 'reference') {
      root.file(`references/${file.filename}`, file.content);
    } else if (file.type === 'asset') {
      root.file(`assets/${file.filename}`, file.content);
    }
  });

  // Generate blob
  // Note: .skill files are just zip files with a different extension
  return await zip.generateAsync({ type: "blob" });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
