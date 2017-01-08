#require ::File.expand_path('', __FILE__)
require 'data_mapper'

require File.dirname(__FILE__) + '/app.rb'
Dir[File.join('routes', '**/*.rb')].each do |file|
  require_relative file
end

DataMapper.finalize

map "/" do
  run RootController
end

map "/managers" do
  run ManagerController
end

map "/links" do
  run LinkController
end

map "/seps" do
  run ServiceEndPointController
end

map "/services" do
  run ServiceController
end

map "/registers" do
  run ServiceRegisterController
end

map "/debug" do
  run DebugController
end

map "/assets" do
 run SDN.sprockets
end

