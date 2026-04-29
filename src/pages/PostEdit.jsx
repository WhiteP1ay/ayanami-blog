import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { api } from '../api/client';

marked.setOptions({
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  },
});

export default function PostEdit() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      api.getPost(id)
        .then(data => {
          setTitle(data.title);
          setContent(data.content);
        })
        .catch(() => navigate('/'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate]);

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.querySelector('.editor-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      const imageMd = `\n![${file.name}](${result.url})\n`;
      setContent(prev => prev + imageMd);
    } catch (err) {
      alert('图片上传失败：' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Also support paste for images
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        setUploading(true);
        try {
          const result = await api.uploadImage(file);
          const imageMd = `\n![image](${result.url})\n`;
          setContent(prev => prev + imageMd);
        } catch (err) {
          alert('图片上传失败：' + err.message);
        } finally {
          setUploading(false);
        }
        return;
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('标题不能为空');
      return;
    }
    setSaving(true);
    try {
      const data = { title: title.trim(), content };
      if (isEditing) {
        await api.updatePost(id, data);
      } else {
        const result = await api.createPost(data);
        navigate(`/post/${result.id}`, { replace: true });
        return;
      }
      navigate(`/post/${id}`);
    } catch (err) {
      alert('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner" /></div>;
  }

  return (
    <div className="container">
      <div className="editor">
        <div className="editor-header">
          <input
            type="text"
            className="editor-title-input"
            placeholder="文章标题..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus={!isEditing}
          />
        </div>

        <div className="editor-toolbar">
          <button onClick={() => insertMarkdown('**', '**')} title="加粗">B</button>
          <button onClick={() => insertMarkdown('*', '*')} title="斜体">I</button>
          <button onClick={() => insertMarkdown('~~', '~~')} title="删除线">S</button>
          <button onClick={() => insertMarkdown('\n## ', '')} title="标题">H2</button>
          <button onClick={() => insertMarkdown('\n### ', '')} title="小标题">H3</button>
          <button onClick={() => insertMarkdown('\n> ', '')} title="引用">引用</button>
          <button onClick={() => insertMarkdown('\n- ', '')} title="列表">列表</button>
          <button onClick={() => insertMarkdown('\n1. ', '')} title="有序列表">1.</button>
          <button onClick={() => insertMarkdown('[', '](url)')} title="链接">链接</button>
          <button onClick={() => insertMarkdown('\n```\n', '\n```\n')} title="代码">代码</button>
          <button onClick={() => insertMarkdown('\n---\n', '')} title="分割线">—</button>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} title="上传图片">
            {uploading ? '上传中...' : '🖼️ 图片'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />

        <div className="editor-mode-toggle">
          <button
            className={!preview ? 'active' : ''}
            onClick={() => setPreview(false)}
          >
            编辑
          </button>
          <button
            className={preview ? 'active' : ''}
            onClick={() => setPreview(true)}
          >
            预览
          </button>
        </div>

        {preview ? (
          <div
            className="editor-preview markdown-body"
            dangerouslySetInnerHTML={{ __html: marked(content || '*还没有内容...*') }}
          />
        ) : (
          <>
            <textarea
              className="editor-textarea"
              placeholder="用 Markdown 写点什么吧...支持直接粘贴图片 ✨"
              value={content}
              onChange={e => setContent(e.target.value)}
              onPaste={handlePaste}
            />
            {/* Hidden drop area */}
            <div
              className="image-upload"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={async e => {
                e.preventDefault();
                const file = e.dataTransfer?.files?.[0];
                if (!file || !file.type.startsWith('image/')) return;
                setUploading(true);
                try {
                  const result = await api.uploadImage(file);
                  setContent(prev => prev + `\n![${file.name}](${result.url})\n`);
                } catch (err) {
                  alert('图片上传失败：' + err.message);
                } finally {
                  setUploading(false);
                }
              }}
            >
              <span className="emoji">📸</span>
              拖拽图片到这里，或点击上传
            </div>
          </>
        )}

        <div className="editor-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : isEditing ? '💾 保存修改' : '🌸 发布文章'}
          </button>
        </div>
      </div>
    </div>
  );
}
