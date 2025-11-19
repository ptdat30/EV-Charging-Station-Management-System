-- Insert achievements với ID cố định
INSERT INTO achievements (id, name, description, criteria_type, criteria_value, badge_color, created_at) VALUES
-- Days Smoke Free Achievements
('first-day-champion', 'First Day Champion', 'Hoàn thành ngày đầu tiên không hút thuốc', 'DAYS_SMOKE_FREE', 1, 'BRONZE', NOW()),
('one-week-hero', 'One Week Hero', 'Không hút thuốc trong 1 tuần', 'DAYS_SMOKE_FREE', 7, 'SILVER', NOW()),
('one-month-master', 'One Month Master', 'Không hút thuốc trong 1 tháng', 'DAYS_SMOKE_FREE', 30, 'GOLD', NOW()),
('three-month-legend', 'Three Month Legend', 'Không hút thuốc trong 3 tháng', 'DAYS_SMOKE_FREE', 90, 'DIAMOND', NOW()),
('six-month-warrior', 'Six Month Warrior', 'Không hút thuốc trong 6 tháng', 'DAYS_SMOKE_FREE', 180, 'LEGENDARY', NOW()),
('one-year-god', 'One Year God', 'Không hút thuốc trong 1 năm', 'DAYS_SMOKE_FREE', 365, 'LEGENDARY', NOW()),

-- Money Saved Achievements
('money-saver-100k', 'Money Saver 100K', 'Tiết kiệm được 100,000 VND', 'MONEY_SAVED', 100000, 'BRONZE', NOW()),
('money-saver-500k', 'Money Saver 500K', 'Tiết kiệm được 500,000 VND', 'MONEY_SAVED', 500000, 'SILVER', NOW()),
('money-saver-1m', 'Money Saver 1M', 'Tiết kiệm được 1,000,000 VND', 'MONEY_SAVED', 1000000, 'GOLD', NOW()),
('money-saver-5m', 'Money Saver 5M', 'Tiết kiệm được 5,000,000 VND', 'MONEY_SAVED', 5000000, 'DIAMOND', NOW()),
('money-saver-10m', 'Money Saver 10M', 'Tiết kiệm được 10,000,000 VND', 'MONEY_SAVED', 10000000, 'LEGENDARY', NOW()),

-- Cigarettes Avoided Achievements
('cigarette-avoider-100', 'Cigarette Avoider 100', 'Tránh được 100 điếu thuốc', 'CIGARETTES_AVOIDED', 100, 'BRONZE', NOW()),
('cigarette-avoider-500', 'Cigarette Avoider 500', 'Tránh được 500 điếu thuốc', 'CIGARETTES_AVOIDED', 500, 'SILVER', NOW()),
('cigarette-avoider-1000', 'Cigarette Avoider 1000', 'Tránh được 1000 điếu thuốc', 'CIGARETTES_AVOIDED', 1000, 'GOLD', NOW()),
('cigarette-avoider-5000', 'Cigarette Avoider 5000', 'Tránh được 5000 điếu thuốc', 'CIGARETTES_AVOIDED', 5000, 'DIAMOND', NOW()),
('cigarette-avoider-10000', 'Cigarette Avoider 10000', 'Tránh được 10000 điếu thuốc', 'CIGARETTES_AVOIDED', 10000, 'LEGENDARY', NOW()),

-- Milestone Achievements
('first-post-sharer', 'First Post Sharer', 'Chia sẻ bài viết đầu tiên trong cộng đồng', 'MILESTONES', 1, 'BRONZE', NOW()),
('community-helper', 'Community Helper', 'Giúp đỡ 10 thành viên trong cộng đồng', 'MILESTONES', 10, 'SILVER', NOW()),
('motivation-master', 'Motivation Master', 'Nhận 100 lượt thích từ cộng đồng', 'MILESTONES', 100, 'GOLD', NOW()),
('community-leader', 'Community Leader', 'Đăng 50 bài viết trong cộng đồng', 'MILESTONES', 50, 'DIAMOND', NOW()),
('inspiration-legend', 'Inspiration Legend', 'Nhận 1000 lượt thích từ cộng đồng', 'MILESTONES', 1000, 'LEGENDARY', NOW());