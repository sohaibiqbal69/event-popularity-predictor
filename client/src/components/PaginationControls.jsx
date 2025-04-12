import React from 'react';
import './PaginationControls.css';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const start = Math.max(0, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="pagination-controls">
            <button
                className="pagination-button prev-button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Previous page"
            >
                ◀
            </button>

            {getPageNumbers().map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`pagination-button page-number ${currentPage === page ? 'active' : ''}`}
                    aria-label={`Page ${page + 1}`}
                >
                    {page + 1}
                </button>
            ))}

            <button
                className="pagination-button next-button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Next page"
            >
                ▶
            </button>
        </div>
    );
};

export default PaginationControls;