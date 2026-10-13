import React from 'react';
import { Star, Folder, Grid } from 'lucide-react';

const CategoryFilter = ({
  categories = [],
  activeCategory,
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavoritesOnly
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.25rem',
      scrollbarWidth: 'none'
    }}>
      {/* All Notes Pill */}
      <button
        onClick={() => {
          onSelectCategory(null);
          if (showFavoritesOnly) onToggleFavoritesOnly(false);
        }}
        className={`btn btn-sm ${!activeCategory && !showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
        style={{ borderRadius: 'var(--radius-full)' }}
      >
        <Grid size={13} />
        <span>All</span>
      </button>

      {/* Favorites Pill */}
      <button
        onClick={() => onToggleFavoritesOnly(!showFavoritesOnly)}
        className={`btn btn-sm ${showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
        style={{
          borderRadius: 'var(--radius-full)',
          ...(showFavoritesOnly ? { background: '#f59e0b', color: '#fff' } : {})
        }}
      >
        <Star size={13} fill={showFavoritesOnly ? '#fff' : 'none'} />
        <span>Favorites</span>
      </button>

      {/* Dynamic Categories */}
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => {
              if (showFavoritesOnly) onToggleFavoritesOnly(false);
              onSelectCategory(isActive ? null : cat.id);
            }}
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              ...(isActive && cat.color ? { background: cat.color, color: '#fff' } : {})
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#fff' : (cat.color || '#6366f1'),
                display: 'inline-block'
              }}
            />
            <span>{cat.name}</span>
            {cat.noteCount !== undefined && (
              <span style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                marginLeft: '2px'
              }}>
                ({cat.noteCount})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
