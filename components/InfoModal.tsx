import React from 'react';
import ResetIcon from './icons/ResetIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl w-11/12 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-800">Giới thiệu & Hướng dẫn sử dụng</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-800 text-3xl font-bold"
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-4">
          <p>
            Chào mừng bạn đến với <strong>Bác Sĩ Đông Y AI</strong>! Tôi là một trợ lý ảo được xây dựng dựa trên kiến thức sâu rộng của Y học cổ truyền phương Đông, kết hợp với công nghệ AI hiện đại để đưa ra những lời khuyên sức khỏe toàn diện và hữu ích.
          </p>

          <h3 className="text-teal-700 font-semibold">Các tính năng chính</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-teal-600 font-bold mt-1">💬</span>
              <div>
                <strong>Trò chuyện & Tư vấn:</strong> Bạn có thể mô tả các triệu chứng, tình trạng sức khỏe của mình. Tôi sẽ phân tích và đưa ra các chẩn đoán sơ bộ, giải thích nguyên nhân theo góc nhìn Đông y và gợi ý các giải pháp phù hợp.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-1"><PaperclipIcon /></span>
              <div>
                <strong>Đính kèm tệp:</strong> Bạn có thể đính kèm hình ảnh (như ảnh lưỡi, da) hoặc tệp PDF (kết quả xét nghiệm) để tôi có thêm thông tin, giúp cho việc tư vấn được chính xác hơn.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-1"><CopyIcon /></span>
              <div>
                <strong>Sao chép nội dung:</strong> Dễ dàng sao chép toàn bộ nội dung tư vấn của tôi chỉ với một cú nhấp chuột để lưu lại hoặc chia sẻ.
              </div>
            </li>
             <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-1"><DownloadIcon /></span>
              <div>
                <strong>Tải xuống .Docx:</strong> Lưu trữ bản tư vấn một cách chuyên nghiệp dưới dạng tệp Word (.docx), giữ nguyên định dạng để bạn có thể xem lại hoặc in ra khi cần.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-1"><ResetIcon /></span>
              <div>
                <strong>Nhiệm vụ mới:</strong> Bắt đầu một cuộc trò chuyện hoàn toàn mới bất cứ lúc nào bằng cách nhấp vào nút này. Lịch sử chat cũ sẽ được xóa để bạn tập trung vào vấn đề mới.
              </div>
            </li>
          </ul>

          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg mt-6">
            <h4 className="font-bold">Lưu ý quan trọng</h4>
            <p className="mt-1">
              Thông tin và tư vấn do tôi cung cấp chỉ mang tính chất <strong>tham khảo và hỗ trợ</strong>. Các nội dung này không thể thay thế cho việc chẩn đoán, khám chữa bệnh và chỉ định trực tiếp từ bác sĩ hoặc chuyên gia y tế có chuyên môn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
