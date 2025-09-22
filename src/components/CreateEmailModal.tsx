import React, { useState } from 'react';
import { X, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { showToast } from '../utils/toast';

interface CreateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateEmailModal({ isOpen, onClose, onSubmit }: CreateEmailModalProps) {
  const [formData, setFormData] = useState({
    sender: 'Hariprasad <hariprasad@psdigitise.com>',
    recipients: [{ recipient: '', status: 'Sent' }],
    message: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = 'http://103.214.132.20:8002/api/v2/document/Email Queue/';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      showToast('Email sent successfully', { type: 'success' });
      onSubmit(result);
      onClose();
      
      // Reset form
      setFormData({
        sender: 'Hariprasad <hariprasad@psdigitise.com>',
        recipients: [{ recipient: '', status: 'Sent' }],
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('Failed to send email', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index].recipient = value;
    setFormData({
      ...formData,
      recipients: newRecipients
    });
  };

  const addRecipient = () => {
    setFormData({
      ...formData,
      recipients: [...formData.recipients, { recipient: '', status: 'Sent' }]
    });
  };

  const removeRecipient = (index: number) => {
    if (formData.recipients.length > 1) {
      const newRecipients = formData.recipients.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        recipients: newRecipients
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  placeholder="Sender Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={recipient.recipient}
                        onChange={(e) => handleRecipientChange(index, e.target.value)}
                        placeholder="Recipient Email"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={loading}
                      />
                      {formData.recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Recipient</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}