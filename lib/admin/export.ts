/**
 * CSV Export Utility
 *
 * Provides functionality to export user data to CSV format
 * with proper Hungarian formatting and character encoding
 */

import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { UserTableRow } from '@/components/admin/UserTable';

/**
 * Export users to CSV file
 *
 * Generates a CSV file with Hungarian headers and formatting,
 * then triggers a download in the browser
 *
 * @param users - Array of user data to export
 */
export function exportUsersToCSV(users: UserTableRow[]): void {
  // Define CSV headers (Hungarian)
  const headers = [
    'Név',
    'Email',
    'Kor',
    'Kvíz Állapot',
    'Elért Kérdés',
    'Összes Kérdés',
    'Csakra Egészség',
    'Vásárolt',
    'Vásárlások Száma',
    'Létrehozva',
  ];

  // Convert user data to CSV rows
  const rows = users.map((user) => [
    user.name,
    user.email,
    user.age?.toString() || '-',
    user.quizStatus === 'completed' ? 'Befejezett' : 'Félbehagyott',
    user.reachedQuestion.toString(),
    user.totalQuestions.toString(),
    getChakraHealthLabel(user.chakraHealth),
    user.hasPurchased ? 'Igen' : 'Nem',
    user.purchaseCount.toString(),
    format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm', { locale: hu }),
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = cell.toString();
          if (
            cellStr.includes(',') ||
            cellStr.includes('"') ||
            cellStr.includes('\n')
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const csvData = BOM + csvContent;

  // Create blob and download
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `felhasznalok_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Get human-readable label for chakra health status
 */
function getChakraHealthLabel(health: string): string {
  switch (health) {
    case 'healthy':
      return 'Egészséges';
    case 'warning':
      return 'Figyelmeztetés';
    case 'critical':
      return 'Kritikus';
    default:
      return 'Ismeretlen';
  }
}

/**
 * Export single user data to JSON
 *
 * Generates a JSON file with detailed user information
 * and triggers a download in the browser
 *
 * @param userId - User ID to export
 * @param userData - User data object
 */
export function exportUserToJSON(userId: string, userData: any): void {
  const jsonData = JSON.stringify(userData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `felhasznalo_${userId}_${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
