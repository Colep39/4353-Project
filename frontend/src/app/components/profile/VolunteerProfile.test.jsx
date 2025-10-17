"use client";
import { render, screen } from '@testing-library/react';
import VolunteerProfile from './VolunteerProfile';

describe('VolunteerProfille Component', () => {
    it('renders volunteer profile data', () => {
        render(<VolunteerProfile />);
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
        expect(screen.getByText('Preferences')).toBeInTheDocument();
    })
})