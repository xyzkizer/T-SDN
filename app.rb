require 'mysql2'
require 'slim'
require 'sprockets'
require 'sinatra/base'
require 'sinatra/cookies'
require 'sinatra/content_for'
require 'rack-flash'
require 'data_mapper'

class Application < Sinatra::Base
  enable :sessions, :logging
  use Rack::MethodOverride
  use Rack::Flash, :accessorize => [:info, :error, :success], :sweep => true
  use Rack::Protection::AuthenticityToken # HTML forms now require: input name="authenticity_token" value=session[:csrf] type="hidden"
  set :public_folder, File.dirname(__FILE__) + '/public'
  set :views, File.dirname(__FILE__) + '/views'
  set :session_secret, "25729f31a6bc7c57f8575db9b79ee468...." # SecureRandom.hex(128)
  set :cookie_options, { path: '/'}

  def self.sprockets
    project_root = File.expand_path(File.dirname(__FILE__))
    assets = Sprockets::Environment.new(project_root)
    assets.append_path('assets/js')
    assets.append_path('assets/css')
    # Twitter Bootstrap...
    #assets.append_path('lib/bootstrap/js')
    #assets.append_path('lib/bootstrap/css')
    assets
  end

  helpers Sinatra::Cookies
  helpers Sinatra::ContentFor
  helpers do
    def authenticity_token
      session[:csrf] = SecureRandom.hex(128) unless session.has_key?(:csrf)
      %Q{<input type="hidden" name="authenticity_token" value="#{session[:csrf]}"/>}
    end
  end

  configure do
    Dir.mkdir('log') unless File.exists?('log')
  end

  configure :test do
    use Rack::CommonLogger, File.new('log/test.log', 'w')
  end

  configure :development do
    use Rack::CommonLogger, File.new('log/development.log', 'w')
  end

  configure :production do
    use Rack::CommonLogger, File.new('log/production.log', 'w')
  end
  #configure :development, :production do
  #  # Configure logging, WTF
  #  set :logging, true
  #  class ::Logger; alias_method :write, :<<; end
  #  file = File.new(Application.root, 'log', "#{environment}.log", "a+")
  #  # Send STDs to log file
  #  #$stdout.reopen(file)
  #  #$stderr.reopen(file)
  #  #$stderr.sync = true
  #  #$stdout.sync = true
  #  # Weekly roll
  #  #log  = Logger.new(logfile, 'daily')
  #  #log.level = Logger::DEBUG if development?
  #  use Rack::CommonLogger, file
  #  #set :log, log

  #  #Compass.add_project_configuration(File.join(Sinatra::Application.root, 'config', 'compass.rb'))
  #end

  configure :development do
    require "sinatra/reloader"
    register Sinatra::Reloader
    also_reload 'routes/**/*.rb'
    also_reload 'views/**/*.rb'
    also_reload 'lib/**/*.rb'
    also_reload 'config/**/*.rb'
    set :raise_errors, true
  end

  [:error, :info, :success].each do |key|
    class_eval "
    def flash_#{key}(key, now=true)
      message(key, :#{key}, now)
    end
    "
  end

  def message(key, type=:notice, now=true)
    hash = now ? flash.now : flash
    hash[type] = key
  end

  def meta(key, value = nil)
    value ? content_for(key) { value } : yield_content(key)
  end

  def content_tag(name, content, attributes = nil)
    name = html_escape(name) unless name.html_safe?
    content = html_escape(content) unless content.html_safe?
    attributes = attributes.map do |key, value|
      value = html_escape(value) unless value.html_safe?
      %Q{#{key}="#{value}"}
    end if attributes && attributes.any?
    start = [name, attributes.join(" ")].reject(&:nil?).join(' ')
    "<#{start}>#{content}</#{name}>"
  end

  def debug_something_with_pry
    Kernel.binding.pry
  end

  error do
    slim :'errors/500'
  end

  not_found do
    slim :'errors/404'
  end

  #error ActiveRecord::RecordNotFound do
  #  slim :'errors/404'
  #end

end

#ActiveRecord::Base.send(:attr_accessible, nil)

# Move to config/init/db.rb if you like
OpenStruct.new(YAML::load(File.open('config/database.yml'))[Application.environment.to_s].symbolize_keys).tap do |config|
  #configure :development do
  #end
  DataMapper::Logger.new($stdout, :debug)
  DataMapper.setup(
    :default,
    'mysql://#{config.username}:#{config.password}@#{config.host}/#{config.database}'
  )
end


