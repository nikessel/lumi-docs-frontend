import React from 'react';

interface TypographyProps {
    color?: 'primary' | 'secondary';
    textSize?: 'small' | 'default' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
    ellipsis?: boolean; // Optional ellipsis prop
    children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
    color = 'primary',
    textSize = 'default',
    className = '',
    ellipsis = false,
    children
}) => {
    // Define class names based on props
    const colorClass = color === 'primary' ? 'text-text_primary' : 'text-text_secondary';
    const sizeClass = {
        small: 'text-small_custom',
        default: 'text-default_custom',
        h1: 'text-h1_custom',
        h2: 'text-h2_custom',
        h3: 'text-h3_custom',
        h4: 'text-h4_custom',
        h5: 'text-h5_custom',
        h6: 'text-h6_custom'
    }[textSize];

    // Apply font-bold if it's a headline and add mb-3
    const isHeadline = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(textSize);
    const fontWeightClass = isHeadline ? 'font-medium' : '';
    const marginBottomClass = isHeadline ? 'mb-2' : '';

    // Combine classes with template literals, adding text-ellipsis if ellipsis is true
    const ellipsisClass = ellipsis ? 'truncate' : '';
    const classes = `${colorClass} ${sizeClass} ${fontWeightClass} ${marginBottomClass} leading-none flex items-center ${ellipsisClass} ${className}`;

    return (
        <span className={classes} >
            {children}
        </span>
    );
};

export default Typography;
