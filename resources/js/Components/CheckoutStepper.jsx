import React from 'react';

/**
 * Komponen Stepper untuk checkout flow
 * @param {number} currentStep - Step saat ini (1-4)
 * Steps: 1=Metode, 2=Alamat, 3=Ongkir, 4=Bayar
 */
export default function CheckoutStepper({ currentStep = 1 }) {
    const steps = [
        { number: 1, label: 'Metode' },
        { number: 2, label: 'Alamat' },
        { number: 3, label: 'Ongkir' },
        { number: 4, label: 'Bayar' },
    ];

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;
                const isUpcoming = step.number > currentStep;

                return (
                    <React.Fragment key={step.number}>
                        {/* Step Circle & Label */}
                        <div className={`flex items-center ${isUpcoming ? 'text-gray-400' : 'text-green-600'}`}>
                            <div className={`
                                rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm
                                ${isCompleted ? 'bg-green-600 text-white' : ''}
                                ${isCurrent ? 'bg-green-600 text-white' : ''}
                                ${isUpcoming ? 'border-2 border-gray-300 text-gray-400' : ''}
                            `}>
                                {isCompleted ? '✓' : step.number}
                            </div>
                            <span className={`ml-2 text-sm ${isCurrent ? 'font-semibold' : 'font-medium'} ${index < steps.length - 1 ? 'hidden sm:inline' : ''}`}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className={`
                                flex-auto border-t-2 mx-3 max-w-[60px]
                                ${step.number < currentStep ? 'border-green-600' : 'border-gray-200'}
                            `}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
