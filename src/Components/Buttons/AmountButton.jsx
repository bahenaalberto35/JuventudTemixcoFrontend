import { useState, useEffect } from 'react';
import './AmountButton.css';

const AMOUNTS = [100, 200, 300, 400];

export function AmountButton({ onChange, value }) {
    const [selected, setSelected] = useState(null);
    const [customMode, setCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const [error, setError] = useState('');

    const MIN_AMOUNT = 50.00;


    useEffect(() => {
        if (value === null || value === "") {
            setSelected(null);
            setCustomMode(false);
            setCustomValue('');
            setError('');
        }
    }, [value]);

    const handleFixed = (amount) => {
        if (customMode && parseFloat(customValue) > 0) {
            setError('Ya ingresaste un monto personalizado. Por favor borra el campo para seleccionar una cantidad.');
            return;
        }
        setError('');
        setSelected(amount);
        setCustomMode(false);
        setCustomValue('');
        if (onChange) onChange(amount);
    };

    const handleOtro = () => {
        setSelected('otro');
        setCustomMode(true);
        setError('');
        if (onChange) onChange(null);
    };

    const handleCustomChange = (e) => {
        let val = e.target.value.replace(',', '.');
        const regex = /^\d*\.?\d{0,2}$/;

        if (val === '' || regex.test(val)) {
            setCustomValue(val);

            if (onChange) {
                const numericValue = parseFloat(val);
                if (!isNaN(numericValue) && numericValue >= MIN_AMOUNT) {
                    setError('');
                    onChange(numericValue);
                } else {
                    onChange(null);
                }
            }
        }
    };

    const handleBlur = () => {
        const numericValue = parseFloat(customValue);

        if (customValue === '') {
            setError('');
            return;
        }

        if (isNaN(numericValue) || numericValue < MIN_AMOUNT) {
            setError(`El monto mínimo para donaciones es de $${MIN_AMOUNT}.00 MXN.`);
        } else {
            setError('');
        }
    };

    return (
        <div className="amount-container">
            <label className="amount-label">Monto</label>
            <div className="amount-grid">
                {AMOUNTS.map((amount) => (
                    <button
                        key={amount}
                        type="button"
                        className={`amount-btn${selected === amount ? ' amount-btn--selected' : ''}`}
                        onClick={() => handleFixed(amount)}
                    >
                        ${amount}
                    </button>
                ))}
                <button
                    type="button"
                    className={`amount-btn${selected === 'otro' ? ' amount-btn--selected' : ''}`}
                    onClick={handleOtro}
                >
                    $ Otro
                </button>
            </div>

            {customMode && (
                <div className="amount-custom-wrap">
                    <input
                        className="amount-custom-input"
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        placeholder="$ 0.00 (MXN)"
                        value={customValue}
                        onChange={handleCustomChange}
                        onBlur={handleBlur}
                    />
                </div>
            )}

            {error && <p className="amount-error">{error}</p>}
        </div>
    );
}