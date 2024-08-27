// boiler plate component

import '../style/ColorPalette.css';

interface ColorPaletteProps {
    colors: string[];
    handleColorSelect: (color: string) => void;
}

const ColorPalette = ({ colors, handleColorSelect }: ColorPaletteProps) => {
    return (
        <div className='color-palette'>
            {colors.map((color, index) => (
                <div key={index} className='box' style={{ background: color }} onClick={() => handleColorSelect(color)}></div>
            ))}
            <div className='eraser' style={{ background: 'white' }} onClick={() => handleColorSelect('eraser')}></div>

        </div>
    );
}

export default ColorPalette;