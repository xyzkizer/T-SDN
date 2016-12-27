#require ::File.expand_path('', __FILE__)

require File.dirname(__FILE__) + '/app.rb'
%w(models routes).each do |name|
  Dir[File.join(name, '**/*.rb')].each do |file|
    require_relative file
  end
end

map "/" do
  run RootController
end

map "/assets" do
 run Application.sprockets
end
